param([string]$Server = 'localhost,1433')
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
foreach ($line in Get-Content -LiteralPath (Join-Path $root '.env')) {
    if ($line -match '^([A-Z][A-Z0-9_]*)=(.*)$') { [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process') }
}
if (-not $env:SQL_SA_PASSWORD) { throw 'Falta SQL_SA_PASSWORD en .env' }
if ($env:DB_PASSWORD -notmatch '^[A-Za-z0-9!@#%^*_=+.-]{16,64}$') { throw 'DB_PASSWORD debe tener 16-64 caracteres ASCII, letras, numeros y simbolos !@#%^*_=+.-' }
$env:SQLCMDPASSWORD = $env:SQL_SA_PASSWORD
Push-Location $root
try {
    & sqlcmd -S $Server -U sa -C -b -i 'database/initialize.sql'
    if ($LASTEXITCODE -ne 0) { throw 'Fallo la inicializacion. Revisa la conexion y los permisos SQL.' }
} finally { Remove-Item Env:SQLCMDPASSWORD -ErrorAction SilentlyContinue; Pop-Location }
