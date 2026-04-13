#requires -Version 5.1

. "$PSScriptRoot/config.ps1"

function Get-PasoriDevices {
    $lines = & $usbipd list

    foreach ($line in $lines) {
        if ($line -notmatch '^\s*(\d+-\d+)\s+([0-9A-Fa-f]{4}:[0-9A-Fa-f]{4})\s+(.+)$') {
            continue
        }

        $busId = $Matches[1]
        $vidPid = $Matches[2].ToLower()
        $fullLine = $line.Trim()
        $isAttached = $fullLine -match 'Attached'

        if ($vidPid -eq $targetId) {
            [PSCustomObject]@{
                BusId = $busId
                VidPid = $vidPid
                IsAttached = $isAttached
                Line = $fullLine
            }
        }
    }
}

try {
    $devices = @(Get-PasoriDevices)
} catch {
    Write-Error "Failed to run 'usbipd list'. $_"
    exit 1
}

if ($devices.Count -eq 0) {
    Write-Host "PaSoRi not found (target: $targetId)."
    exit 0
}

foreach ($device in $devices) {
    if ($device.IsAttached) {
        Write-Host "Already attached: $($device.BusId)"
        continue
    }

    $args = @('attach', '--busid', $device.BusId, '--wsl', $targetDistro)
    if ($enableAutoAttach) {
        $args += '--auto-attach'
    }

    Write-Host "Attaching: $($device.BusId)"
    & $usbipd @args

    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Attach failed for $($device.BusId)"
    }
}

Write-Host "All PaSoRi devices processed."
