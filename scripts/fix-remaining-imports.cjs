const fs = require('fs');
const path = require('path');

// List of files that had errors in PowerShell due to brackets
const problematicFiles = [
  'app/admin/articles/[id]/edit/page.tsx',
  'app/admin/gallery/[collection]/[album]/new/page.tsx',
  'app/admin/gallery/[collection]/[album]/[caseId]/layout.tsx',
  'app/admin/gallery/[collection]/[album]/[caseId]/page.tsx',
  'app/admin/gallery/[collection]/[album]/layout.tsx',
  'app/admin/gallery/[collection]/[album]/page.tsx',
  'app/admin/gallery/[collection]/layout.tsx',
  'app/admin/gallery/[collection]/page.tsx',
  'app/api/admin/fix-article/[id]/route.ts',
  'app/api/articles/subcategories/[id]/route.ts',
  'app/api/articles/[id]/route.ts',
  'app/api/cloudinary/asset/[publicId]/route.ts',
  'app/api/cloudinary/responsive/[publicId]/route.ts',
  'app/api/gallery/images/[id]/route.ts',
  'app/articles/[slug]/layout.tsx',
  'app/articles/[slug]/page.tsx',
  'app/gallery/[...slug]/layout.tsx',
  'app/gallery/[...slug]/page.tsx',
  'app/gallery/[collection]/[album]/[caseId]/page.tsx',
  'app/gallery/[collection]/[album]/page.tsx',
  'app/gallery/[collection]/page.tsx'
];

// Import path mappings from old to new locations
const importMappings = {
  '@/components/ui/': '@/components/shared/ui/',
  '@/components/nav-bar': '@/components/shared/layout/nav-bar',
  '@/components/footer': '@/components/shared/layout/footer',
  '@/components/hero': '@/components/shared/layout/hero',
  '@/components/article-layout': '@/components/shared/layout/article-layout',
  '@/components/articles/ArticleCard': '@/components/features/articles/components/ArticleCard',
  '@/components/articles/ArticleContent': '@/components/features/articles/components/ArticleContent',
  '@/components/articles/ArticleList': '@/components/features/articles/components/ArticleList',
  '@/components/articles/ArticleNavigation': '@/components/features/articles/components/ArticleNavigation',
  '@/components/articles/ArticlePreview': '@/components/features/articles/components/ArticlePreview',
  '@/components/articles/ArticleCategory': '@/components/features/articles/components/ArticleCategory',
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
  '@/components/ChatInterface': '@/components/features/chat/ChatInterface',
  '@/components/chat/': '@/components/features/chat/',
  '@/components/GallerySidebar': '@/components/features/gallery/GallerySidebar',
  '@/components/case-viewer': '@/components/features/gallery/case-viewer',
  '@/components/MarketingFeatures': '@/components/features/marketing/MarketingFeatures',
  '@/components/media/': '@/components/shared/media/',
  '@/components/seo/': '@/components/shared/seo/',
  '@/components/StructuredData': '@/components/shared/seo/StructuredData',
  '@/components/layouts/AdminLayout': '@/components/shared/layout/AdminLayout',
  '@/components/layouts/TwoColumnLayout': '@/components/shared/layout/TwoColumnLayout',
  '@/components/nav-main': '@/components/shared/layout/nav-main',
  '@/components/nav-user': '@/components/shared/layout/nav-user',
  '@/components/section': '@/components/shared/layout/section',
  '@/components/sections/': '@/components/shared/layout/sections/',
  '@/components/providers': '@/components/shared/providers',
  '@/components/ErrorBoundary': '@/components/shared/ErrorBoundary',
  '../articles/ArticleCard': '@/components/features/articles/components/ArticleCard',
  '../../articles/ArticleCard': '@/components/features/articles/components/ArticleCard',
  '../../../articles/ArticleCard': '@/components/features/articles/components/ArticleCard',
};

let fixedCount = 0;

console.log('Fixing imports in files with brackets...\n');

problematicFiles.forEach(file => {
  const filePath = path.join('D:/fal', file);
  
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
      console.log(`✅ Fixed imports in: ${file}`);
      fixedCount++;
    } else {
      console.log(`⏭️  No changes needed in: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✨ Fixed imports in ${fixedCount} additional files`);
