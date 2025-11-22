# Hub Analysis Script
$hubs = Get-ChildItem 'src/pages/hubs/*.jsx' | Where-Object { $_.Name -like '*Hub.jsx' }
foreach ($hub in $hubs) {
    $lines = (Get-Content $hub.FullName).Count
    Write-Host ""$($hub.Name): $lines lines""
}
