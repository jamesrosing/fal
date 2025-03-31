# FAL Media Directory Structure

```
public/
│
├── images/
│   ├── global/
│   │   ├── logos/
│   │   ├── icons/
│   │   └── ui/
│   │
│   ├── pages/
│   │   ├── home/
│   │   ├── about/
│   │   ├── services/
│   │   │   ├── plastic-surgery/
│   │   │   ├── dermatology/
│   │   │   ├── medical-spa/
│   │   │   └── functional-medicine/
│   │   ├── team/
│   │   └── example/
│   │       └── hero.jpg
│   │
│   ├── placeholder.jpg
│   ├── placeholder.svg
│   ├── hero-about-poster.jpg
│   ├── hero-about-fallback.jpg
│   ├── hero-fallback.jpg
│   └── hero-poster.jpg
│
└── videos/
    ├── backgrounds/
    ├── content/
    ├── hero-480p.mp4
    ├── hero-480p.webm
    ├── hero-720p.mp4
    └── hero-720p.webm

components/
│
├── Hero/
│   ├── Hero.js
│   └── assets/
│       └── hero-background.jpg
│
├── ServiceCard/
│   └── assets/
│
└── TeamMember/
    └── assets/
```

## How to Use the Media System

1. **Place images in the appropriate directories**:
   - Global assets: `public/images/global/[category]/`
   - Page-specific: `public/images/pages/[pagename]/`
   - Component-specific: `components/[ComponentName]/assets/`

2. **Register media assets**:
   ```bash
   npm run media:register
   ```

3. **Reference media in components**:
   ```jsx
   // Component assets
   <OptimizedImage id="component:Hero/assets/hero-background.jpg" alt="Description" />
   
   // Page assets 
   <OptimizedImage id="page:home/hero.jpg" alt="Description" />
   
   // Cloudinary assets
   <OptimizedImage id="hero/main-hero" alt="Description" />
   ```

4. **Use the MediaRenderer for automatic type detection**:
   ```jsx
   <MediaRenderer id="your-media-id" alt="Description" />
   ``` 