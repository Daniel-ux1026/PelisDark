$ErrorActionPreference = 'Stop'

function Open-BackupConnection([string]$Server, [string]$AdminUser) {
    $builder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new()
    $builder['Data Source'] = $Server
    $builder['Initial Catalog'] = 'master'
    $builder['Encrypt'] = $true
    $builder['TrustServerCertificate'] = $true
    $builder['Connect Timeout'] = 10
    if ($env:SQLCMDPASSWORD) {
        $password = ConvertTo-SecureString $env:SQLCMDPASSWORD -AsPlainText -Force
    } else {
        $password = Read-Host "Contrasena SQL de $AdminUser (no se guardara)" -AsSecureString
    }
    $password.MakeReadOnly()
    $credential = [System.Data.SqlClient.SqlCredential]::new($AdminUser, $password)
    $connection = [System.Data.SqlClient.SqlConnection]::new($builder.get_ConnectionString(), $credential)
    $connection.Open()
    return $connection
}

function New-BackupCommand($Connection, [string]$Sql, [hashtable]$Parameters = @{}) {
    $command = $Connection.CreateCommand()
    $command.CommandText = $Sql
    $command.CommandTimeout = 600
    foreach ($name in $Parameters.Keys) { $null = $command.Parameters.AddWithValue($name, $Parameters[$name]) }
    return $command
}

function Read-BackupTable($Connection, [string]$Sql, [hashtable]$Parameters = @{}) {
    $command = New-BackupCommand $Connection $Sql $Parameters
    $adapter = [System.Data.SqlClient.SqlDataAdapter]::new($command)
    $table = [System.Data.DataTable]::new()
    try { $null = $adapter.Fill($table); return ,$table }
    finally { $adapter.Dispose(); $command.Dispose() }
}
