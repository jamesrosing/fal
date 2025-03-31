# Create a base directory for the ZIP
$baseDir = "fal-media-structure"
New-Item -Path $baseDir -ItemType Directory -Force

# Create the main directories
$publicImages = "$baseDir/public/images"
$publicVideos = "$baseDir/public/videos"
$components = "$baseDir/components"

# Create global image directories
$globalDirs = @("logos", "icons", "ui")
foreach ($dir in $globalDirs) {
    New-Item -Path "$publicImages/global/$dir" -ItemType Directory -Force
}

# Create page-specific image directories
$pageDirs = @("home", "about", "services", "team", "gallery")
foreach ($dir in $pageDirs) {
    New-Item -Path "$publicImages/pages/$dir" -ItemType Directory -Force
}

# Create service subdirectories
$serviceDirs = @("plastic-surgery", "dermatology", "medical-spa", "functional-medicine")
foreach ($dir in $serviceDirs) {
    New-Item -Path "$publicImages/pages/services/$dir" -ItemType Directory -Force
}

# Create video directories
$videoDirs = @("backgrounds", "content")
foreach ($dir in $videoDirs) {
    New-Item -Path "$publicVideos/$dir" -ItemType Directory -Force
}

# Create common component asset directories
$componentDirs = @("Hero", "ServiceCard", "TeamMember")
foreach ($dir in $componentDirs) {
    New-Item -Path "$components/$dir/assets" -ItemType Directory -Force
}

# Add a README to help users
$readme = @"
# FAL Media Structure

Place your media files in the appropriate directories:

## Public Images
- global/logos/ - Logo assets
- global/icons/ - Icon assets
- global/ui/ - UI elements

- pages/home/ - Homepage images
- pages/about/ - About page images
- pages/services/ - Service category images
- pages/team/ - Team page images
- pages/gallery/ - Gallery images

## Videos
- backgrounds/ - Video backgrounds
- content/ - Content videos

## Component Assets
- Hero/assets/ - Hero component-specific assets
- ServiceCard/assets/ - Service card component assets
- TeamMember/assets/ - Team member component assets

After filling this structure with your images:
1. ZIP the entire folder
2. Upload back to the project
3. Run: npm run media:register
"@

$readme | Out-File -FilePath "$baseDir/README.md"

# ZIP the directory structure
Compress-Archive -Path $baseDir -DestinationPath "fal-media-structure.zip" -Force

Write-Host "Media structure created and zipped to fal-media-structure.zip"
Write-Host "Download this file, extract it, fill the folders with your images, and ZIP it back up." 