#!/usr/bin/env pwsh

$fileCount = 0
$fixedCount = 0

# Get all files that might contain CldVideoPlayer usage
$files = Get-ChildItem -Path . -Recurse -Include "*.tsx","*.jsx","*.ts","*.js" | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" }

foreach ($file in $files) {
    # Read content line by line and join with newlines
    $content = (Get-Content -Path $file) -join "`n"
    
    # Skip files that don't have CldVideoPlayer and autoPlay
    if ($content -notmatch "CldVideoPlayer" -or $content -notmatch "autoPlay") {
        continue
    }
    
    $fileCount++
    $originalContent = $content
    
    # Replace autoPlay prop in JSX/TSX CldVideoPlayer components
    $content = $content -replace "(<CldVideoPlayer[^>]*)(autoPlay=)([^>]*>)", '$1autoplay=$3'
    
    # Also fix camelCase property references in code
    $content = $content -replace "\.autoPlay", ".autoplay"
    $content = $content -replace "autoPlay\s*:", "autoplay:"
    $content = $content -replace "autoPlay\s*=", "autoplay ="
    
    # If content was modified, save changes
    if ($content -ne $originalContent) {
        $content | Set-Content -Path $file
        Write-Host "Fixed autoPlay -> autoplay in: $file" -ForegroundColor Green
        $fixedCount++
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "- Files processed that contain CldVideoPlayer and autoPlay: $fileCount" -ForegroundColor White
Write-Host "- Files fixed: $fixedCount" -ForegroundColor Green

if ($fixedCount -eq 0) {
    Write-Host "`nNo files needed fixing - all CldVideoPlayer components are already using 'autoplay'." -ForegroundColor Green
} else {
    Write-Host "`nFixed $fixedCount files with incorrect 'autoPlay' props." -ForegroundColor Cyan
} 