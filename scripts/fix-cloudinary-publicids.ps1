#!/usr/bin/env pwsh

$fileCount = 0
$fixedCount = 0

# Get all files that contain CldImage, CldVideo, or CldVideoPlayer
$files = Get-ChildItem -Path . -Recurse -Include "*.tsx","*.jsx","*.ts","*.js" | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" } |
    Select-String -Pattern "(CldImage|CldVideo|CldVideoPlayer)" |
    Select-Object -ExpandProperty Path -Unique

foreach ($file in $files) {
    $fileCount++
    $lines = Get-Content -Path $file
    $modified = $false
    $newContent = @()
    
    foreach ($line in $lines) {
        # Check for and fix src attributes with leading slashes
        if ($line -match "src=[`"']/") {
            $line = $line -replace "src=([`"'])/", "src=`$1"
            $modified = $true
        }
        
        # Check for and fix publicId variables with leading slashes
        if ($line -match "publicId\s*=\s*[`"']/") {
            $line = $line -replace "publicId\s*=\s*([`"'])/", "publicId=`$1"
            $modified = $true
        }
        
        # Check for variable assignments with leading slashes
        if ($line -match "const\s+\w+\s*=\s*[`"']/") {
            $line = $line -replace "const\s+(\w+)\s*=\s*([`"'])/", "const `$1=`$2"
            $modified = $true
        }
        
        # Add the modified or original line to the new content
        $newContent += $line
    }
    
    # Save if modified
    if ($modified) {
        $newContent | Set-Content -Path $file
        Write-Host "Fixed publicId formatting in: $file" -ForegroundColor Green
        $fixedCount++
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "- Files checked with Cloudinary components: $fileCount" -ForegroundColor White
Write-Host "- Files with fixed publicId formatting: $fixedCount" -ForegroundColor Green

Write-Host "`nRemember that Cloudinary publicIds should:" -ForegroundColor Cyan
Write-Host "1. Not start with a slash" -ForegroundColor White
Write-Host "2. Include folder structure if needed (e.g., 'folder/image-name')" -ForegroundColor White
Write-Host "3. Never include the full Cloudinary URL (e.g., 'https://res.cloudinary.com/...')" -ForegroundColor White
Write-Host "4. Match exactly what appears in your Cloudinary Media Library" -ForegroundColor White 