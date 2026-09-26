param([string]$Server = 'tcp:localhost,1433', [string]$AdminUser = 'sa')
. (Join-Path $PSScriptRoot 'SqlServer-Tools.ps1')
$destination = Join-Path (Split-Path $PSScriptRoot -Parent) 'backups'
$connection = $null
try {
    $connection = Open-BackupConnection $Server $AdminUser
    $table = Read-BackupTable $connection "SELECT CAST(SERVERPROPERTY('InstanceDefaultBackupPath') AS nvarchar(4000)) AS folder, CAST(SERVERPROPERTY('ProductVersion') AS varchar(100)) AS version;"
    $folder = [string]$table.Rows[0].folder
    if (-not $folder) { throw 'SQL Server no devuelve una carpeta de backups. Configura su directorio de respaldo.' }
    $filename = 'PelisDark_' + (Get-Date -Format 'yyyyMMdd_HHmmss') + '_' + [Guid]::NewGuid().ToString('N').Substring(0,8) + '.bak'
    $serverFile = $folder.TrimEnd('\', '/') + '\' + $filename
    $command = New-BackupCommand $connection 'BACKUP DATABASE [PelisDark] TO DISK=@path WITH COPY_ONLY, CHECKSUM, COMPRESSION;' @{ '@path' = $serverFile }
    try { $null = $command.ExecuteNonQuery() } finally { $command.Dispose() }
    $command = New-BackupCommand $connection 'RESTORE VERIFYONLY FROM DISK=@path WITH CHECKSUM;' @{ '@path' = $serverFile }
    try { $null = $command.ExecuteNonQuery() } finally { $command.Dispose() }

    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    $localFile = Join-Path $destination $filename
    # Stream the server-side file through SQL: no broad filesystem permission changes are needed.
    $literal = $serverFile.Replace("'", "''")
    $command = New-BackupCommand $connection "SELECT BulkColumn FROM OPENROWSET(BULK N'$literal', SINGLE_BLOB) AS backup_file;"
    $reader = $null
    $stream = $null
    try {
        $reader = $command.ExecuteReader([System.Data.CommandBehavior]::SequentialAccess)
        if (-not $reader.Read()) { throw 'No fue posible leer la copia creada por SQL Server.' }
        $stream = [System.IO.File]::Open($localFile, 'CreateNew', 'Write', 'None')
        $buffer = [byte[]]::new(1048576)
        [long]$offset = 0
        while (($read = $reader.GetBytes(0, $offset, $buffer, 0, $buffer.Length)) -gt 0) {
            $stream.Write($buffer, 0, [int]$read)
            $offset += $read
        }
    } finally {
        if ($stream) { $stream.Dispose() }
        if ($reader) { $reader.Dispose() }
        $command.Dispose()
    }
    $hash = (Get-FileHash -LiteralPath $localFile -Algorithm SHA256).Hash
    $command = New-BackupCommand $connection "SELECT CONVERT(varchar(64), HASHBYTES('SHA2_256', BulkColumn), 2) FROM OPENROWSET(BULK N'$literal', SINGLE_BLOB) AS backup_file;"
    try { $serverHash = [string]$command.ExecuteScalar() } finally { $command.Dispose() }
    if ($hash -ne $serverHash) { throw 'El hash de la copia local no coincide con el archivo del servidor. No utilices esta copia.' }
    $manifest = [ordered]@{
        database = 'PelisDark'
        createdUtc = [DateTime]::UtcNow.ToString('o')
        file = $filename
        bytes = (Get-Item -LiteralPath $localFile).Length
        sha256 = $hash
        sqlServerVersion = [string]$table.Rows[0].version
        serverFile = $serverFile
        verification = 'RESTORE VERIFYONLY WITH CHECKSUM; server/local SHA256 match'
    }
    $json = $manifest | ConvertTo-Json
    [System.IO.File]::WriteAllText((Join-Path $destination ($filename + '.json')), $json, [System.Text.UTF8Encoding]::new($false))
    [System.IO.File]::WriteAllText((Join-Path $destination 'latest.json'), $json, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Copia completa verificada: $localFile"
    Write-Host 'Contiene datos privados. No la publiques ni la subas a GitHub.'
} finally { if ($connection) { $connection.Dispose() } }
