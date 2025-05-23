#!/usr/bin/env pwsh

Write-Host "Starting Cloudinary Fixes..." -ForegroundColor Cyan

# 1. Verify CSS imports for CldVideoPlayer
Write-Host "`n=== Fixing CSS imports for Cloudinary video components ===" -ForegroundColor Yellow
./scripts/verify-cloudinary-css.ps1

# 2. Fix autoPlay to autoplay in CldVideoPlayer components
Write-Host "`n=== Fixing autoPlay to autoplay in Cloudinary components ===" -ForegroundColor Yellow
./scripts/fix-cloudinary-autoplay.ps1  

# 3. Fix publicId formatting
Write-Host "`n=== Fixing Cloudinary publicId formats ===" -ForegroundColor Yellow
./scripts/fix-cloudinary-publicids.ps1

Write-Host "`nAll Cloudinary fixes have been applied!" -ForegroundColor Green
Write-Host "Please verify by visiting: /example/cloudinary-test" -ForegroundColor Cyan 