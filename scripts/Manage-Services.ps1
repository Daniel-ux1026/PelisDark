param(
    [Parameter(Mandatory = $true)][ValidateSet('Start', 'Stop')][string]$Action,
    [switch]$NoBrowser
)
$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$local = Join-Path $root '.local'
$statePath = Join-Path $local 'services.json'
$script:records = @()
$script:newNames = @()
$markers = @{
    backend = Join-Path $root 'backend\target\pelisdark-api-2.0.0.jar'
    frontend = Join-Path $root 'frontend\node_modules\vite\bin\vite.js'
    chatbot = Join-Path $root 'chatbot\app.py'
    mailpit = Join-Path $root '.local\mailpit\mailpit.exe'
}

function Quote-Argument([string]$Value) { return '"' + $Value + '"' }

function Save-State {
    $data = @{ project = $root; services = @($script:records) } | ConvertTo-Json -Depth 4
    [System.IO.File]::WriteAllText($statePath, $data, [System.Text.UTF8Encoding]::new($false))
}

function Test-Owned($Record) {
    $name = $Record.name -replace '-launcher$', ''
    if (-not $markers.ContainsKey($name) -or [int]$Record.pid -eq $PID) { return $false }
    $process = Get-Process -Id ([int]$Record.pid) -ErrorAction SilentlyContinue
    if (-not $process) { return $false }
    if ($process.StartTime.ToUniversalTime().Ticks.ToString() -ne [string]$Record.started) { return $false }
    $info = Get-CimInstance Win32_Process -Filter "ProcessId=$($Record.pid)"
    return $info.CommandLine -and $info.CommandLine.IndexOf($markers[$name], [StringComparison]::OrdinalIgnoreCase) -ge 0
}

function Stop-Tree([int]$ProcessId) {
    $parent = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $parent) { return }
    $children = @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId")
    foreach ($child in $children) {
        if ($child.CreationDate -ge $parent.StartTime) { Stop-Tree ([int]$child.ProcessId) }
    }
    $current = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if ($current -and $current.StartTime -eq $parent.StartTime) {
        Stop-Process -Id $ProcessId -Force
        Wait-Process -Id $ProcessId -Timeout 10 -ErrorAction SilentlyContinue
    }
}

function Stop-Managed([string[]]$Names) {
    foreach ($name in $Names) {
        $record = $script:records | Where-Object { $_.name -eq $name } | Select-Object -First 1
        if (-not $record) { continue }
        if (Test-Owned $record) {
            Stop-Tree ([int]$record.pid)
            Write-Host "Detenido: $name"
        } else { Write-Host "Sin proceso propio activo: $name (no se cerro ningun proceso ajeno)." }
        $script:records = @($script:records | Where-Object { $_.name -ne $name })
        Save-State
    }
}

function Test-Port([int]$Port) {
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $operation = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
        if (-not $operation.AsyncWaitHandle.WaitOne(800)) { return $false }
        $client.EndConnect($operation)
        return $true
    } catch { return $false } finally { $client.Dispose() }
}

function Get-Record([string]$Name, [int]$ProcessId) {
    $p = Get-Process -Id $ProcessId -ErrorAction Stop
    return [pscustomobject]@{ name = $Name; pid = $ProcessId; started = $p.StartTime.ToUniversalTime().Ticks.ToString() }
}

function Start-Managed([string]$Name, [string]$Executable, [string]$Arguments, [int]$Port, [string]$Url) {
    $existing = $script:records | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    if ($existing -and (Test-Owned $existing)) {
        try { $null = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3 }
        catch { throw "$Name ya existe, pero no responde. Ejecuta Detener-PelisDark.bat y vuelve a iniciar." }
        Write-Host "Ya iniciado: $Name"
        return
    }
    if (Test-Port $Port) { throw "El puerto $Port esta ocupado por un proceso no administrado. No se cerrara automaticamente. Cierra ese servicio y vuelve a intentar." }
    if ($Name -eq 'mailpit' -and (Test-Port 1025)) { throw 'El puerto SMTP 1025 esta ocupado. No se cerrara un servidor de correo ajeno.' }
    Stop-Managed @("$Name-launcher")
    $script:records = @($script:records | Where-Object { $_.name -ne $Name })
    $p = Start-Process -FilePath $Executable -ArgumentList $Arguments -WorkingDirectory $root -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $local "$Name.log") -RedirectStandardError (Join-Path $local "$Name-error.log")
    $record = Get-Record $Name $p.Id
    $script:records += $record
    $script:newNames += $Name
    Save-State
    $deadline = (Get-Date).AddSeconds(75)
    do {
        Start-Sleep -Milliseconds 700
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
            if ($response.StatusCode -ne 200) { continue }
            $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | Select-Object -First 1
            $actual = Get-Record $Name ([int]$listener.OwningProcess)
            if (-not (Test-Owned $actual)) { throw 'El proceso que respondio no pertenece al proyecto.' }
            if ($actual.pid -ne $record.pid) {
                # Java launchers and Python virtual environments may create a separate server process.
                $record.name = "$Name-launcher"
                $script:newNames += $record.name
                $script:records += $actual
                Save-State
            }
            Write-Host "Iniciado: $Name ($Url)"
            return
        } catch { }
        if (-not (Get-Process -Id $p.Id -ErrorAction SilentlyContinue) -and -not (Test-Port $Port)) { break }
    } while ((Get-Date) -lt $deadline)
    throw "No fue posible iniciar $Name. Revisa .local/$Name.log y .local/$Name-error.log."
}

$lock = $null
try {
    New-Item -ItemType Directory -Path $local -Force | Out-Null
    try { $lock = [System.IO.File]::Open((Join-Path $local 'services.lock'), 'OpenOrCreate', 'ReadWrite', 'None') }
    catch { throw 'Ya hay otra operacion de inicio o parada en curso. Espera a que termine.' }
    if (Test-Path -LiteralPath $statePath) {
        $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
        if ($state.project -ne $root) { throw 'El registro de servicios pertenece a otra carpeta. No se modificaran sus procesos.' }
        $script:records = @($state.services | Where-Object { $null -ne $_ })
    }
    if ($Action -eq 'Stop') {
        $names = @($script:records | ForEach-Object { $_.name })
        [array]::Reverse($names)
        Stop-Managed $names
        Write-Host 'PelisDark detenido. SQL Server se mantiene activo para no afectar otras bases de datos.'
    } else {
        $settings = @{}
        $envFile = Join-Path $root '.env'
        if (-not (Test-Path -LiteralPath $envFile)) { throw 'Falta .env. Consulta README.md para configurar SQL Server y el chatbot.' }
        foreach ($line in Get-Content -LiteralPath $envFile) {
            if ($line -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
                $key = $Matches[1]
                $value = $Matches[2]
                $settings[$key] = $value
                if ($key -match '^(DB_|SMTP_|OPENAI_|MAIL_FROM$|COOKIE_SECURE$|FRONTEND_URL$)') {
                    [Environment]::SetEnvironmentVariable($key, $value, 'Process')
                }
            }
        }
        if (-not $settings['DB_PASSWORD']) { throw 'Falta DB_PASSWORD en .env. Prepara la conexion SQL Server antes de iniciar.' }
        $env:SPRING_PROFILES_ACTIVE = ''
        $java = (Get-Command java -ErrorAction Stop).Source
        $node = (Get-Command node -ErrorAction Stop).Source
        $python = Join-Path $root '.venv\Scripts\python.exe'
        if (-not (Test-Path -LiteralPath $python)) { throw 'Falta el entorno Python .venv. Sigue el paso del chatbot en README.md.' }
        if (-not (Test-Path -LiteralPath $markers.frontend)) { throw 'Faltan dependencias React. Ejecuta: npm ci --prefix frontend' }
        if (-not (Test-Path -LiteralPath $markers.backend)) { throw 'Falta compilar Java. Ejecuta: mvn -f backend/pom.xml package' }
        if ($settings['DB_URL'] -match '^jdbc:sqlserver://(?:localhost|127\.0\.0\.1):1433;' -and -not (Test-Port 1433)) {
            $sql = Get-Service -Name MSSQLSERVER -ErrorAction SilentlyContinue
            if ($sql -and $sql.Status -ne 'Running') {
                try { Start-Service -Name MSSQLSERVER }
                catch { throw 'SQL Server esta detenido. Inicia MSSQLSERVER en Servicios de Windows o ejecuta Iniciar-PelisDark.bat como administrador.' }
                $sql.WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
            }
            $deadline = (Get-Date).AddSeconds(20)
            while (-not (Test-Port 1433) -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 1 }
            if (-not (Test-Port 1433)) { throw 'SQL Server no responde en localhost:1433. Revisa el servicio, TCP/IP o Docker Desktop.' }
        }
        $smtpHost = $settings['SMTP_HOST']
        $smtpPort = $settings['SMTP_PORT']
        if ((-not $smtpHost -or $smtpHost -in @('localhost', '127.0.0.1')) -and (-not $smtpPort -or $smtpPort -eq '1025')) {
            if (-not (Test-Path -LiteralPath $markers.mailpit)) { throw 'Falta .local/mailpit/mailpit.exe. Consulta la instalacion de Mailpit en README.md.' }
            Start-Managed 'mailpit' $markers.mailpit '--listen 127.0.0.1:8025 --smtp 127.0.0.1:1025 --disable-version-check' 8025 'http://127.0.0.1:8025'
        } else { Write-Host 'Se usara el SMTP externo configurado; no se inicia Mailpit.' }
        $javaArgs = '-Djava.net.preferIPv4Stack=true ' + (Quote-Argument "-Djdk.net.unixdomain.tmpdir=$local") + ' -jar ' + (Quote-Argument $markers.backend) + ' --server.address=127.0.0.1 --server.port=8080'
        Start-Managed 'backend' $java $javaArgs 8080 'http://127.0.0.1:8080/api/catalog'
        $pythonArgs = '-m streamlit run ' + (Quote-Argument $markers.chatbot) + ' --server.address 127.0.0.1 --server.port 8501 --server.headless true --browser.gatherUsageStats false'
        Start-Managed 'chatbot' $python $pythonArgs 8501 'http://127.0.0.1:8501/_stcore/health'
        $nodeArgs = (Quote-Argument $markers.frontend) + ' ' + (Quote-Argument (Join-Path $root 'frontend')) + ' --host 127.0.0.1 --port 5173 --strictPort'
        Start-Managed 'frontend' $node $nodeArgs 5173 'http://127.0.0.1:5173'
        Write-Host ''
        Write-Host 'Web:     http://localhost:5173'
        Write-Host 'Chatbot: http://localhost:8501'
        if (-not $settings['OPENAI_API_KEY'] -or $settings['OPENAI_API_KEY'].StartsWith('coloca_')) { Write-Host 'El chatbot necesita OPENAI_API_KEY en .env para responder.' }
        Write-Host 'Los servicios continuan activos al cerrar esta ventana. Usa Detener-PelisDark.bat para detenerlos.'
        if (-not $NoBrowser) { Start-Process 'http://localhost:5173' }
    }
} catch {
    Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
    if ($Action -eq 'Start' -and $script:newNames.Count -gt 0) {
        try { $names = @($script:newNames); [array]::Reverse($names); Stop-Managed $names }
        catch { Write-Host 'No se pudieron detener todos los procesos recien iniciados. Ejecuta Detener-PelisDark.bat.' }
    }
    exit 1
} finally {
    if ($lock) { $lock.Dispose() }
}
