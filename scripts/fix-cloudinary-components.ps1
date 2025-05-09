# PowerShell script to identify and fix Cloudinary component issues
Write-Host "Scanning for Cloudinary component issues..." -ForegroundColor Cyan

# -----------------------------------------------------
# PHASE 1: Scan for component issues
# -----------------------------------------------------

# Create an empty array to store issues
$issues = @()

# Check for autoPlay property (should be autoplay in v6.0.0)
Write-Host "Checking for autoPlay vs autoplay property issues..." -ForegroundColor Yellow
$autoPlayFiles = Get-ChildItem -Path "components", "app" -Recurse -Include "*.tsx", "*.jsx" | 
    Select-String -Pattern "autoPlay\s*[=:]\s*[{]?true[}]?" | 
    Where-Object { $_.Line -match "CldVideo|CldVideoPlayer" }

foreach ($file in $autoPlayFiles) {
    $issues += [PSCustomObject]@{
        FilePath = $file.Path
        LineNumber = $file.LineNumber
        Issue = "autoPlay property should be 'autoplay' in Cloudinary v6.0.0"
        Type = "Property"
        Line = $file.Line.Trim()
    }
}

# Check for UnifiedMedia usage (should be migrated to CldImage/CldVideo)
Write-Host "Checking for UnifiedMedia usage (to be migrated)..." -ForegroundColor Yellow
$unifiedMediaFiles = Get-ChildItem -Path "components", "app" -Recurse -Include "*.tsx", "*.jsx" | 
    Select-String -Pattern "import.*UnifiedMedia|<UnifiedMedia" 

foreach ($file in $unifiedMediaFiles) {
    $issues += [PSCustomObject]@{
        FilePath = $file.Path
        LineNumber = $file.LineNumber
        Issue = "UnifiedMedia should be replaced with CldImage or CldVideo"
        Type = "Component"
        Line = $file.Line.Trim()
    }
}

# Check for deprecated CloudinaryImage, CloudinaryVideo usage
Write-Host "Checking for deprecated CloudinaryImage/CloudinaryVideo usage..." -ForegroundColor Yellow
$deprecatedFiles = Get-ChildItem -Path "components", "app" -Recurse -Include "*.tsx", "*.jsx" | 
    Select-String -Pattern "import.*CloudinaryImage|import.*CloudinaryVideo|<CloudinaryImage|<CloudinaryVideo|CloudinaryUploader" 

foreach ($file in $deprecatedFiles) {
    $issues += [PSCustomObject]@{
        FilePath = $file.Path
        LineNumber = $file.LineNumber
        Issue = "Deprecated CloudinaryImage/CloudinaryVideo/CloudinaryUploader components should be replaced with CldImage/CldVideo"
        Type = "Component"
        Line = $file.Line.Trim()
    }
}

# Check for OptimizedImage, OptimizedVideo usage
Write-Host "Checking for OptimizedImage/OptimizedVideo usage..." -ForegroundColor Yellow
$optimizedFiles = Get-ChildItem -Path "components", "app" -Recurse -Include "*.tsx", "*.jsx" | 
    Select-String -Pattern "import.*OptimizedImage|import.*OptimizedVideo|<OptimizedImage|<OptimizedVideo" 

foreach ($file in $optimizedFiles) {
    $issues += [PSCustomObject]@{
        FilePath = $file.Path
        LineNumber = $file.LineNumber
        Issue = "OptimizedImage/OptimizedVideo should be replaced with CldImage/CldVideo"
        Type = "Component"
        Line = $file.Line.Trim()
    }
}

# Check for transformations property (should be replaced with namedTransformations)
Write-Host "Checking for transformations property usage..." -ForegroundColor Yellow
$transformationsFiles = Get-ChildItem -Path "components", "app" -Recurse -Include "*.tsx", "*.jsx" | 
    Select-String -Pattern "transformations\s*[=:]\s*[{[]" | 
    Where-Object { $_.Line -match "CldImage" }

foreach ($file in $transformationsFiles) {
    $issues += [PSCustomObject]@{
        FilePath = $file.Path
        LineNumber = $file.LineNumber
        Issue = "transformations property is deprecated in Cloudinary v6.0.0, use namedTransformations instead"
        Type = "Property"
        Line = $file.Line.Trim()
    }
}

# -----------------------------------------------------
# PHASE 2: Report issues
# -----------------------------------------------------

if ($issues.Count -eq 0) {
    Write-Host "No Cloudinary component issues found!" -ForegroundColor Green
}
else {
    # Group issues by file
    $issuesByFile = $issues | Group-Object -Property FilePath

    Write-Host "`nFound $($issues.Count) Cloudinary component issues in $($issuesByFile.Count) files:`n" -ForegroundColor Red

    foreach ($fileGroup in $issuesByFile) {
        Write-Host "FILE: $($fileGroup.Name)" -ForegroundColor Cyan
        
        foreach ($issue in $fileGroup.Group | Sort-Object LineNumber) {
            Write-Host "  Line $($issue.LineNumber): $($issue.Issue)" -ForegroundColor Yellow
            Write-Host "    $($issue.Line)" -ForegroundColor Gray
        }
        
        Write-Host ""
    }
    
    # Summarize issues by type
    $issuesByType = $issues | Group-Object -Property Type
    Write-Host "SUMMARY BY TYPE:" -ForegroundColor Cyan
    foreach ($typeGroup in $issuesByType) {
        Write-Host "  $($typeGroup.Name): $($typeGroup.Count) issues" -ForegroundColor Yellow
    }
}

# -----------------------------------------------------
# PHASE 3: Quick fixes for common issues (optional)
# -----------------------------------------------------

$shouldPerformFixes = $false
$response = Read-Host "`nWould you like to automatically fix some of these issues? (y/n)"
if ($response -eq "y") {
    $shouldPerformFixes = $true
}

if ($shouldPerformFixes) {
    # Fix autoPlay to autoplay
    Write-Host "`nFixing autoPlay property issues..." -ForegroundColor Cyan
    $autoPlayFiles = $issues | Where-Object { $_.Issue -like "*autoPlay property*" } | Select-Object -ExpandProperty FilePath | Get-Unique
    
    foreach ($file in $autoPlayFiles) {
        # Read the content
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Replace autoPlay with autoplay
            $updatedContent = $content -replace "autoPlay(\s*[=:]\s*[{]?)(.+?)([}]?)", "autoplay`$1`$2`$3"
            # Write back to the file
            Set-Content -Path $file -Value $updatedContent -ErrorAction SilentlyContinue
            Write-Host "  Fixed: $file" -ForegroundColor Green
        } else {
            Write-Host "  Error reading file: $file" -ForegroundColor Red
        }
    }
}

Write-Host "`nScript completed. More complex component migrations require manual updates." -ForegroundColor Cyan
Write-Host "Refer to memory-bank/CLOUDINARY-IMPLEMENTATION-SUMMARY.md for migration guidelines." -ForegroundColor Cyan 