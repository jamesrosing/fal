const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import path mappings from old to new locations
const importMappings = {
  // UI components - these were moved to shared/ui
  '@/components/ui/': '@/components/shared/ui/',
  
  // Layout components
  '@/components/nav-bar': '@/components/shared/layout/nav-bar',
  '@/components/footer': '@/components/shared/layout/footer',
  '@/components/hero': '@/components/shared/layout/hero',
  '@/components/article-layout': '@/components/shared/layout/article-layout',
  
  // Article components
  '@/components/articles/ArticleCard': '@/components/features/articles/components/ArticleCard',
  '@/components/articles/ArticleContent': '@/components/features/articles/components/ArticleContent',
  '@/components/articles/ArticleList': '@/components/features/articles/components/ArticleList',
  '@/components/articles/ArticleNavigation': '@/components/features/articles/components/ArticleNavigation',
  '@/components/articles/ArticlePreview': '@/components/features/articles/components/ArticlePreview',
  '@/components/articles/ArticleCategory': '@/components/features/articles/components/ArticleCategory',
  
  // Admin components
  '@/components/admin-nav-bar': '@/components/features/admin/admin-nav-bar',
  '@/components/app-sidebar': '@/components/features/admin/app-sidebar',
  '@/components/team-switcher': '@/components/features/admin/team-switcher',
  '@/components/nav-admin': '@/components/features/admin/nav-admin',
  '@/components/nav-manage': '@/components/features/admin/nav-manage',
  '@/components/image-upload-field': '@/components/features/admin/image-upload-field',
  '@/components/image-uploader': '@/components/features/admin/image-uploader',
  '@/components/image-display': '@/components/features/admin/image-display',
  '@/components/SiteMediaManager': '@/components/features/admin/SiteMediaManager',
  '@/components/MediaManagement': '@/components/features/admin/MediaManagement',
  '@/components/CloudinaryUploader': '@/components/features/admin/CloudinaryUploader',
  '@/components/CloudinaryMediaLibrary': '@/components/features/admin/CloudinaryMediaLibrary',
  '@/components/DataForm': '@/components/features/admin/DataForm',
  '@/components/editor/RichTextEditor': '@/components/features/admin/editor/RichTextEditor',
  
  // Chat components
  '@/components/ChatInterface': '@/components/features/chat/ChatInterface',
  '@/components/chat/': '@/components/features/chat/',
  
  // Gallery components
  '@/components/GallerySidebar': '@/components/features/gallery/GallerySidebar',
  '@/components/case-viewer': '@/components/features/gallery/case-viewer',
  
  // Marketing components
  '@/components/MarketingFeatures': '@/components/features/marketing/MarketingFeatures',
  
  // Media components
  '@/components/media/': '@/components/shared/media/',
  
  // SEO components
  '@/components/seo/': '@/components/shared/seo/',
  '@/components/StructuredData': '@/components/shared/seo/StructuredData',
  
  // Layout components
  '@/components/layouts/AdminLayout': '@/components/shared/layout/AdminLayout',
  '@/components/layouts/TwoColumnLayout': '@/components/shared/layout/TwoColumnLayout',
  '@/components/nav-main': '@/components/shared/layout/nav-main',
  '@/components/nav-user': '@/components/shared/layout/nav-user',
  '@/components/section': '@/components/shared/layout/section',
  '@/components/sections/': '@/components/shared/layout/sections/',
  
  // Providers
  '@/components/providers': '@/components/shared/providers',
  
  // ErrorBoundary
  '@/components/ErrorBoundary': '@/components/shared/ErrorBoundary',
  
  // Relative imports from sections
  '../articles/ArticleCard': '@/components/features/articles/components/ArticleCard',
  '../../articles/ArticleCard': '@/components/features/articles/components/ArticleCard',
  '../../../articles/ArticleCard': '@/components/features/articles/components/ArticleCard',
};

// Function to fix imports in a file
function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check each mapping
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      const regex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, `from '${newPath}`);
        modified = true;
      }
    }
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Scanning for files to fix imports...\n');
  
  // Find all TypeScript and JavaScript files
  const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
    cwd: 'D:/fal',
    absolute: true,
    ignore: [
      '**/node_modules/**',
      '**/.next/**',
      '**/backup/**',
      '**/.git/**',
      '**/scripts/fix-imports.js'
    ]
  });
  
  console.log(`Found ${files.length} files to check\n`);
  
  let fixedCount = 0;
  
  // Process each file
  for (const file of files) {
    if (fixImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✨ Fixed imports in ${fixedCount} files`);
}

// Run the script
main().catch(console.error);
