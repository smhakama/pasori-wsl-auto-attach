#requires -Version 5.1

. "$PSScriptRoot/config.ps1"

while ($true) {
    & "$PSScriptRoot/attach-once.ps1"
    Start-Sleep -Seconds $intervalSeconds
}
