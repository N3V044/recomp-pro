$port = 5173
$maxRetries = 5
$retryCount = 0

function Test-Port {
    param($port)
    $tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    return $tcp -ne $null
}

while ($true) {
    if (-not (Test-Port $port)) {
        Write-Host "Server is down. Starting..."
        Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Hidden
        Start-Sleep -Seconds 10
    } else {
        Write-Host "Server is up."
    }
    Start-Sleep -Seconds 5
}
