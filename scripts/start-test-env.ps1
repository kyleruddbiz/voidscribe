$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$chromeFlag = '--disable-features=CalculateNativeWinOcclusion'
$devServerPort = 4321
$repoRoot = Split-Path $PSScriptRoot -Parent

function Get-ChromeMainProcess {
    Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" |
        Where-Object { $_.CommandLine -and $_.CommandLine -notlike '*--type=*' } |
        Select-Object -First 1
}

function Wait-Until([scriptblock]$Condition, [int]$TimeoutSeconds) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (& $Condition) { return $true }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

function Test-DevServerListening {
    [bool](Get-NetTCPConnection -LocalPort $devServerPort -State Listen -ErrorAction SilentlyContinue)
}

$chrome = Get-ChromeMainProcess
if ($chrome -and $chrome.CommandLine -notlike "*$chromeFlag*") {
    Write-Output 'Chrome is running without the occlusion flag; closing it.'
    taskkill /IM chrome.exe 2>$null | Out-Null
    if (-not (Wait-Until { -not (Get-ChromeMainProcess) } 15)) {
        Write-Error 'Chrome did not close.'
        exit 1
    }
    $chrome = $null
}
if (-not $chrome) {
    Write-Output 'Launching Chrome.'
    Start-Process $chromePath -ArgumentList $chromeFlag
    if (-not (Wait-Until { Get-ChromeMainProcess } 15)) {
        Write-Error 'Chrome did not start.'
        exit 1
    }
    Start-Sleep -Seconds 2
}

if (-not (Test-DevServerListening)) {
    Write-Output 'Starting dev server.'
    Start-Process npm.cmd -ArgumentList 'run', 'dev' -WorkingDirectory $repoRoot -WindowStyle Hidden
    if (-not (Wait-Until { Test-DevServerListening } 60)) {
        Write-Error "Dev server did not start on port $devServerPort."
        exit 1
    }
}

Write-Output 'Test environment ready.'
