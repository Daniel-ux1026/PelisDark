param([string]$AdminUser = 'sa')
$Server = 'tcp:localhost,1433'
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$config = Join-Path $root '.env'
$lines = [System.Collections.Generic.List[string]]::new()
if (Test-Path -LiteralPath $config) {
    foreach ($line in [System.IO.File]::ReadAllLines($config)) { $lines.Add($line) }
}
$values = @{}
foreach ($line in $lines) {
    if ($line -match '^([A-Z][A-Z0-9_]*)=(.*)$') { $values[$Matches[1]] = $Matches[2] }
}
if (-not $values['DB_PASSWORD']) {
    $bytes = [byte[]]::new(24)
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $values['DB_PASSWORD'] = 'Pd9!' + [Convert]::ToHexString($bytes)
}
if ($values['DB_PASSWORD'] -notmatch '^[A-Za-z0-9!@#%^*_=+.-]{16,64}$') { throw 'DB_PASSWORD no cumple el formato permitido para inicializar SQL Server.' }
$originalPassword = $env:SQLCMDPASSWORD
if (-not $env:SQLCMDPASSWORD) {
    $secret = Read-Host 'Contrasena del administrador SQL (no se guardara)' -AsSecureString
    $credential = [System.Management.Automation.PSCredential]::new($AdminUser, $secret)
    $env:SQLCMDPASSWORD = $credential.GetNetworkCredential().Password
}
$originalAppPassword = $env:DB_PASSWORD
$env:DB_PASSWORD = $values['DB_PASSWORD']
Push-Location $root
try {
    & sqlcmd -S $Server -U $AdminUser -C -l 10 -b -i 'database/initialize.sql'
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo inicializar SQL Server. La configuracion no fue modificada.' }
    # Only the application credential is persisted; preserve unrelated API and SMTP settings.
    $updates = @{
        DB_URL = 'jdbc:sqlserver://localhost:1433;databaseName=PelisDark;encrypt=true;trustServerCertificate=true'
        DB_USER = 'pelisdark_app'
        DB_PASSWORD = $values['DB_PASSWORD']
        COOKIE_SECURE = 'false'
    }
    foreach ($key in $updates.Keys) {
        $index = -1
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i].StartsWith($key + '=')) { $index = $i; break }
        }
        $entry = $key + '=' + $updates[$key]
        if ($index -ge 0) { $lines[$index] = $entry } else { $lines.Add($entry) }
    }
    [System.IO.File]::WriteAllLines($config, $lines, [System.Text.UTF8Encoding]::new($false))
    Write-Host 'Base preparada. Credencial de aplicacion guardada en .env; no se guardo la contrasena del administrador.'
} finally {
    $env:SQLCMDPASSWORD = $originalPassword
    $env:DB_PASSWORD = $originalAppPassword
    Pop-Location
}
