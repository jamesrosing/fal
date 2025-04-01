# Base directory for the ZIP structure
$baseDir = "fal-media-structure-from-map"
New-Item -Path $baseDir -ItemType Directory -Force

# Directories derived from the usage map
$dirsToCreate = @(
    "$baseDir/public/images/global/logos",
    "$baseDir/public/images/global/icons",
    "$baseDir/public/images/global/ui",
    "$baseDir/public/images/pages/home",
    "$baseDir/public/images/pages/about",
    "$baseDir/public/images/pages/services",
    "$baseDir/public/images/pages/services/plastic-surgery",
    "$baseDir/public/images/pages/services/dermatology",
    "$baseDir/public/images/pages/services/medical-spa",
    "$baseDir/public/images/pages/services/functional-medicine",
    "$baseDir/public/images/pages/team",
    "$baseDir/public/images/pages/gallery",
    "$baseDir/public/images/pages/example", # Present in map
    "$baseDir/public/images/financing", # Implied from financing/hero.jpg
    "$baseDir/public/images/appointment", # Implied from hero/appointment-hero.jpg
    "$baseDir/public/images/reviews", # Implied from hero/reviews-hero.jpg
    "$baseDir/public/videos/backgrounds",
    "$baseDir/public/videos/content",
    "$baseDir/components/Hero/assets",
    "$baseDir/components/ServiceCard/assets", # Assumed based on structure
    "$baseDir/components/TeamMember/assets" # Assumed based on structure
)

foreach ($dir in $dirsToCreate) {
    New-Item -Path $dir -ItemType Directory -Force -ErrorAction SilentlyContinue
}

# Add a README
$readme = @"
# FAL Media Structure (Based on Usage Map)

This structure reflects the directories identified in the media usage map.
Place your media files accordingly.

After filling this structure with your images:
1. ZIP the entire '$baseDir' folder.
2. Upload the ZIP back to the project.
3. Extract the 'public' and 'components' folders into your project root.
4. Run: npm run media:register
"@

$readme | Out-File -FilePath "$baseDir/README.md" -Encoding utf8

# ZIP the directory structure
Compress-Archive -Path "$($baseDir)/*" -DestinationPath "$($baseDir).zip" -Force

Write-Host "Media structure created based on usage map and zipped to $($baseDir).zip"
Write-Host "Download this file, extract it, fill the folders, and ZIP it back up." 