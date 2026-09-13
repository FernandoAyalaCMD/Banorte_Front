$process = Start-Process -FilePath "ngrok" -ArgumentList "http", "3001", "--log", "stdout" -RedirectStandardOutput "ngrok.log" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 4
$url = (Get-Content ngrok.log | Select-String "url=" | Select-Object -Last 1).ToString().Split("url=")[1].Split(" ")[0]
if ($url) {
    Write-Host "NEW NGROK URL: $url"
    $envFile = 'c:/Users/ayala/OneDrive/Desktop/HACK2026/banorte_front/.env'
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace 'EXPO_PUBLIC_API_URL=.*', "EXPO_PUBLIC_API_URL=$url"
    Set-Content -Path $envFile -Value $envContent
    Write-Host "Updated .env with $url"
} else {
    Write-Host "Could not find ngrok URL in log."
}
