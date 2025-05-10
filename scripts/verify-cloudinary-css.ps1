#!/usr/bin/env pwsh

$fileCount = 0
$missingCssCount = 0
$fixedCount = 0

# Get all files that import CldVideoPlayer 
$files = Get-ChildItem -Path . -Recurse -Include "*.tsx","*.jsx","*.ts","*.js" | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" } |
    Select-String -Pattern "import.*CldVideoPlayer.*from.*next-cloudinary" |
    Select-Object -ExpandProperty Path -Unique

foreach ($file in $files) {
    $fileCount++
    # Read content line by line and join with newlines
    $content = (Get-Content -Path $file) -join "`n"
    
    # Check if the file uses CldVideoPlayer but is missing the CSS import
    if ($content -match "import.*CldVideoPlayer.*from.*next-cloudinary" -and 
        $content -notmatch "import.*next-cloudinary/dist/cld-video-player.css") {
        
        Write-Host "Missing CSS import in: $file" -ForegroundColor Yellow
        $missingCssCount++
        
        # Add the CSS import after the CldVideoPlayer import
        $newContent = $content -replace "(import.*CldVideoPlayer.*from.*next-cloudinary.*\r?\n)", "`$1import 'next-cloudinary/dist/cld-video-player.css'`r`n"
        
        # Write the updated content back to the file
        $newContent | Set-Content -Path $file
        
        Write-Host "Fixed CSS import in: $file" -ForegroundColor Green
        $fixedCount++
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "- Files checked with CldVideoPlayer: $fileCount" -ForegroundColor White
Write-Host "- Files missing CSS import: $missingCssCount" -ForegroundColor Yellow
Write-Host "- Files fixed: $fixedCount" -ForegroundColor Green

if ($missingCssCount -eq 0) {
    Write-Host "`nAll CldVideoPlayer components have the required CSS import." -ForegroundColor Green
} else {
    Write-Host "`nFixed CSS imports in $fixedCount files." -ForegroundColor Cyan
} 