param(
    [string]$Server = 'tcp:localhost,1433',
    [string]$AdminUser = 'sa',
    [string]$Database = 'PelisDark_Copia',
    [string]$BackupPath = ''
)
. (Join-Path $PSScriptRoot 'SqlServer-Tools.ps1')
$expectedHash = ''
if ($Database -notmatch '^[A-Za-z][A-Za-z0-9_]{0,63}$' -or $Database -eq 'PelisDark') {
    throw 'Usa un nombre nuevo, como PelisDark_Copia. Este script no sobrescribe la base activa.'
}
if (-not $BackupPath) {
    $manifestPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'backups\latest.json'
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    $localFile = Join-Path (Split-Path $manifestPath -Parent) $manifest.file
    if ((Get-FileHash -LiteralPath $localFile -Algorithm SHA256).Hash -ne $manifest.sha256) { throw 'La copia local no coincide con su hash registrado.' }
    $expectedHash = $manifest.sha256
    $BackupPath = $manifest.serverFile
}
$connection = $null
try {
    $connection = Open-BackupConnection $Server $AdminUser
    $command = New-BackupCommand $connection 'SELECT COUNT(*) FROM sys.databases WHERE name=@name;' @{ '@name' = $Database }
    try { $exists = $command.ExecuteScalar() } finally { $command.Dispose() }
    if ($exists -ne 0) { throw "La base $Database ya existe. No se modifico; elige otro nombre." }
    if ($expectedHash) {
        $literal = $BackupPath.Replace("'", "''")
        $command = New-BackupCommand $connection "SELECT CONVERT(varchar(64), HASHBYTES('SHA2_256', BulkColumn), 2) FROM OPENROWSET(BULK N'$literal', SINGLE_BLOB) AS backup_file;"
        try { $serverHash = [string]$command.ExecuteScalar() } finally { $command.Dispose() }
        if ($serverHash -ne $expectedHash) { throw 'La copia accesible por SQL Server no coincide con el archivo local verificado.' }
    }
    $command = New-BackupCommand $connection 'RESTORE VERIFYONLY FROM DISK=@path WITH CHECKSUM;' @{ '@path' = $BackupPath }
    try { $null = $command.ExecuteNonQuery() } finally { $command.Dispose() }
    $files = Read-BackupTable $connection 'RESTORE FILELISTONLY FROM DISK=@path;' @{ '@path' = $BackupPath }
    $folders = Read-BackupTable $connection "SELECT CAST(SERVERPROPERTY('InstanceDefaultDataPath') AS nvarchar(4000)) AS data_folder, CAST(SERVERPROPERTY('InstanceDefaultLogPath') AS nvarchar(4000)) AS log_folder;"
    if (-not $folders.Rows[0].data_folder -or -not $folders.Rows[0].log_folder) { throw 'No se pudieron determinar las carpetas de datos de SQL Server.' }
    $moves = @()
    $parameters = @{ '@path' = $BackupPath }
    $index = 0
    $suffix = [Guid]::NewGuid().ToString('N').Substring(0,8)
    foreach ($file in $files.Rows) {
        if ($file.Type -notin @('D', 'L')) { throw 'Este script solo admite archivos de datos y log tradicionales.' }
        $folder = if ($file.Type -eq 'L') { [string]$folders.Rows[0].log_folder } else { [string]$folders.Rows[0].data_folder }
        $extension = if ($file.Type -eq 'L') { '.ldf' } elseif ($index -eq 0) { '.mdf' } else { '.ndf' }
        $parameters["@logical$index"] = [string]$file.LogicalName
        $parameters["@physical$index"] = $folder.TrimEnd('\', '/') + '\' + $Database + '_' + $suffix + '_' + $index + $extension
        $moves += "MOVE @logical$index TO @physical$index"
        $index++
    }
    $sql = "RESTORE DATABASE [$Database] FROM DISK=@path WITH CHECKSUM, RECOVERY, " + ($moves -join ', ') + ';'
    $command = New-BackupCommand $connection $sql $parameters
    try { $null = $command.ExecuteNonQuery() } finally { $command.Dispose() }
    $command = New-BackupCommand $connection "DBCC CHECKDB ([$Database]) WITH NO_INFOMSGS;"
    try { $null = $command.ExecuteNonQuery() } finally { $command.Dispose() }
    Write-Host "Restaurada y comprobada: $Database. PelisDark no se modifico."
} finally { if ($connection) { $connection.Dispose() } }
