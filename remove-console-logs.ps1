# Remove all console.log from project

Write-Host "Starting to remove console.log..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src\app" -Filter "*.ts" -Recurse

$totalRemoved = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove console.log lines
    $content = $content -replace "^\s*console\.log\(.*?\);\s*$", "" -replace "`r`n`r`n`r`n", "`r`n`r`n"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $removed = ([regex]::Matches($originalContent, "console\.log")).Count
        $totalRemoved += $removed
        Write-Host "OK $($file.Name): Removed $removed console.log" -ForegroundColor Green
    }
}

Write-Host "`nTotal removed: $totalRemoved console.log!" -ForegroundColor Cyan
Write-Host "Done! Project is clean now." -ForegroundColor Green
