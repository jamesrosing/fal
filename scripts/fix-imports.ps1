# PowerShell script to fix imports after component refactoring

# Import path mappings from old to new locations
$importMappings = @{
    # UI components - these were moved to shared/ui
    '@/components/ui/' = '@/components/shared/ui/'
    
    # Layout components
    '@/components/nav-bar' = '@/components/shared/layout/nav-bar'
    '@/components/footer' = '@/components/shared/layout/footer'
    '@/components/hero' = '@/components/shared/layout/hero'
    '@/components/article-layout' = '@/components/shared/layout/article-layout'
    
    # Article components
    '@/components/articles/ArticleCard' = '@/components/features/articles/components/ArticleCard'
    '@/components/articles/ArticleContent' = '@/components/features/articles/components/ArticleContent'
    '@/components/articles/ArticleList' = '@/components/features/articles/components/ArticleList'
    '@/components/articles/ArticleNavigation' = '@/components/features/articles/components/ArticleNavigation'
    '@/components/articles/ArticlePreview' = '@/components/features/articles/components/ArticlePreview'
    '@/components/articles/ArticleCategory' = '@/components/features/articles/components/ArticleCategory'
    
    # Admin components
    '@/components/admin-nav-bar' = '@/components/features/admin/admin-nav-bar'
    '@/components/app-sidebar' = '@/components/features/admin/app-sidebar'
    '@/components/team-switcher' = '@/components/features/admin/team-switcher'
    '@/components/nav-admin' = '@/components/features/admin/nav-admin'
    '@/components/nav-manage' = '@/components/features/admin/nav-manage'
    '@/components/image-upload-field' = '@/components/features/admin/image-upload-field'
    '@/components/image-uploader' = '@/components/features/admin/image-uploader'
    '@/components/image-display' = '@/components/features/admin/image-display'
    '@/components/SiteMediaManager' = '@/components/features/admin/SiteMediaManager'
    '@/components/MediaManagement' = '@/components/features/admin/MediaManagement'
    '@/components/CloudinaryUploader' = '@/components/features/admin/CloudinaryUploader'
    '@/components/CloudinaryMediaLibrary' = '@/components/features/admin/CloudinaryMediaLibrary'
    '@/components/DataForm' = '@/components/features/admin/DataForm'
    '@/components/editor/RichTextEditor' = '@/components/features/admin/editor/RichTextEditor'
    
    # Chat components
    '@/components/ChatInterface' = '@/components/features/chat/ChatInterface'
    '@/components/chat/' = '@/components/features/chat/'
    
    # Gallery components
    '@/components/GallerySidebar' = '@/components/features/gallery/GallerySidebar'
    '@/components/case-viewer' = '@/components/features/gallery/case-viewer'
    
    # Marketing components
    '@/components/MarketingFeatures' = '@/components/features/marketing/MarketingFeatures'
    
    # Media components
    '@/components/media/' = '@/components/shared/media/'
    
    # SEO components
    '@/components/seo/' = '@/components/shared/seo/'
    '@/components/StructuredData' = '@/components/shared/seo/StructuredData'
    
    # Layout components
    '@/components/layouts/AdminLayout' = '@/components/shared/layout/AdminLayout'
    '@/components/layouts/TwoColumnLayout' = '@/components/shared/layout/TwoColumnLayout'
    '@/components/nav-main' = '@/components/shared/layout/nav-main'
    '@/components/nav-user' = '@/components/shared/layout/nav-user'
    '@/components/section' = '@/components/shared/layout/section'
    '@/components/sections/' = '@/components/shared/layout/sections/'
    
    # Providers
    '@/components/providers' = '@/components/shared/providers'
    
    # ErrorBoundary
    '@/components/ErrorBoundary' = '@/components/shared/ErrorBoundary'
    
    # Relative imports from sections
    '../articles/ArticleCard' = '@/components/features/articles/components/ArticleCard'
    '../../articles/ArticleCard' = '@/components/features/articles/components/ArticleCard'
    '../../../articles/ArticleCard' = '@/components/features/articles/components/ArticleCard'
}

# Function to fix imports in a file
function Fix-Imports {
    param(
        [string]$FilePath
    )
    
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        $modified = $false
        
        # Check each mapping
        foreach ($mapping in $importMappings.GetEnumerator()) {
            $oldPath = [regex]::Escape($mapping.Key)
            $newPath = $mapping.Value
            
            # Match both single and double quotes
            $pattern = "from\s+['""]$oldPath"
            
            if ($content -match $pattern) {
                $content = $content -replace $pattern, "from '$newPath"
                $modified = $true
            }
        }
        
        # Write back if modified
        if ($modified) {
            Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "[FIXED] Fixed imports in: $FilePath" -ForegroundColor Green
            return $true
        }
        
        return $false
    }
    catch {
        Write-Host "[ERROR] Error processing ${FilePath}: $_" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "[SCANNING] Scanning for files to fix imports..." -ForegroundColor Cyan
Write-Host ""

# Set the working directory
$projectPath = "D:\fal"
Set-Location $projectPath

# Find all TypeScript and JavaScript files
$files = Get-ChildItem -Path $projectPath -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
    Where-Object { 
        $_.FullName -notmatch "node_modules" -and 
        $_.FullName -notmatch "\.next" -and 
        $_.FullName -notmatch "backup" -and 
        $_.FullName -notmatch "\.git" -and
        $_.FullName -notmatch "fix-imports\.(js|ps1|cjs)"
    }

Write-Host "Found $($files.Count) files to check" -ForegroundColor Yellow
Write-Host ""

$fixedCount = 0

# Process each file
foreach ($file in $files) {
    if (Fix-Imports -FilePath $file.FullName) {
        $fixedCount++
    }
}

Write-Host ""
Write-Host "[COMPLETE] Fixed imports in $fixedCount files" -ForegroundColor Green
