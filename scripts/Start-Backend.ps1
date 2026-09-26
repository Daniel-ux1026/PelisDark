param([switch]$Preview)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $root '.env'
if (Test-Path -LiteralPath $envFile) {
    foreach ($line in Get-Content -LiteralPath $envFile) {
        if ($line -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
            [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
        }
    }
}
if ($Preview) { $env:SPRING_PROFILES_ACTIVE = 'preview' }
else {
    $env:SPRING_PROFILES_ACTIVE = ''
    if (-not $env:DB_PASSWORD) { throw 'Configura DB_PASSWORD en .env antes de iniciar SQL Server.' }
}
Push-Location (Join-Path $root 'backend')
try {
    $tempDir = Join-Path $root '.local'
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    & mvn "-Dmaven.repo.local=$root/.m2/repository" "-Dspring-boot.run.jvmArguments=-Djava.net.preferIPv4Stack=true -Djdk.net.unixdomain.tmpdir=$tempDir" spring-boot:run
}
finally { Pop-Location }
