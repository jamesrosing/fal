# Media Management System Documentation

## Overview

The Media Management System provides a structured interface for organizing, browsing, and managing media assets throughout the site. It uses a hierarchical directory structure that mirrors the application's component organization, making it intuitive to find and manage media assets for specific sections of the website.

## Design Architecture

The system follows a code editor-inspired design with a sidebar navigation and main content area:

1. **Sidebar Navigation**: A collapsible tree view that organizes media assets by page structure
2. **Main Content Area**: Displays the media assets for the selected category
3. **Search System**: Filters media assets across all categories
4. **Cloudinary Integration**: Handles media upload, storage, and retrieval
5. **Placeholder Management**: Creates and manages media placeholders

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Title, Search, New Placeholder Button)              │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│                │                                            │
│                │                                            │
│  Sidebar       │  Main Content Area                         │
│  Navigation    │  (Selected Category Content)               │
│  (Tree View)   │                                            │
│                │                                            │
│                │                                            │
│                │                                            │
├────────────────┴────────────────────────────────────────────┤
│ CloudinaryUploader (Modal)                                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### Frontend Components
- **MediaLibraryAdmin**: Main container component
- **Sidebar**: Navigation component with collapsible tree structure
- **DirectoryItem**: Individual folder/file in the sidebar
- **MainContent**: Displays media assets for selected category
- **CloudinaryUploader**: Handles media uploads via Cloudinary

### Backend Components
- **Media Assets API**: Manages placeholder creation and asset assignments
- **Cloudinary API Integration**: Handles image/video storage and retrieval

## Data Organization

Media assets are organized in a hierarchical structure that mirrors the site's component organization:

```
- Homepage
  - Hero
  - Mission Section
    - Background
  - Other Sections...
- About Pages
  - Hero
  - Mission
  - Team
- Services
  - Plastic Surgery
    - Hero
    - Procedures
  - Other Services...
- Shared Components
  - Sections
  - UI Elements
  - Layout
- Global Elements
  - Logo
  - Icons
  - Backgrounds
- Other Categories...
```

Each media asset consists of:
- **placeholder_id**: Unique identifier following the pattern `[page]-[section]-[element]`
- **cloudinary_id**: Reference to the actual media in Cloudinary (if assigned)
- **metadata**: Additional information about the asset

## Key Files

- `app/admin/media/page.tsx`: Main implementation of the Media Management System
- `components/CloudinaryUploader.tsx`: Component for uploading media to Cloudinary
- `lib/cloudinary.ts`: Utilities for Cloudinary integration
- `lib/media-assets.ts`: Utilities for managing media assets
- `app/api/media/assets/create/route.ts`: API endpoint for creating new placeholders
- `app/api/site/media-assets/route.ts`: API endpoints for retrieving and updating media assets

## Explanation for Non-Technical Users

The Media Management System works like a digital filing cabinet for all the images and videos on the website. Here's how it works:

1. **Organization**: Media is organized by the pages and sections where they appear on the website. Just like a file explorer on your computer, you can navigate through folders to find the specific image you're looking for.

2. **Placeholders**: Each spot where an image or video appears on the website has a "placeholder" - think of it as a labeled slot that can have a media file assigned to it. Each placeholder has a specific ID that identifies where it belongs on the website.

3. **Upload Process**: 
   - Click on a category in the left sidebar to see what media belongs there
   - Use the Upload button to add new media to that section
   - The system connects with Cloudinary (our media storage service) to store the actual images and videos

4. **Search**: If you can't find what you're looking for, use the search bar to find media by its name or location.

5. **Replacement**: You can easily replace existing media by clicking the "Replace" button next to any image.

## Technical Implementation Details

The Media Management System uses a React-based architecture with the following key technical aspects:

### State Management
The component uses React's `useState` and `useEffect` hooks to manage:
- Loaded media assets (`mediaAssets`)
- Navigation state (`selectedCategory`, `selectedSubcategory`, `expandedCategories`)
- UI state (`showCreateForm`, `cloudinaryModalOpen`, `searchTerm`)
- Error handling (`error`)

### Data Structure
Media assets are organized in a nested object structure that supports:
- Multi-level hierarchical categorization
- Recursive component rendering
- Efficient filtering and search

### Key Functions

1. `organizeMediaAssets`: Transforms the flat array of media assets into a hierarchical structure:
   ```typescript
   const organizeMediaAssets = (assets: MediaAsset[]) => {
     // Create nested structure
     const structure = { ... };
     
     // Place each asset in the correct location
     const placeAsset = (asset: MediaAsset) => {
       const id = asset.placeholder_id.toLowerCase();
       // Pattern matching to determine asset placement
       if (id.match(/^home-hero/) || id === 'hero-home') {
         structure.homepage.children.hero.items.push(asset);
       } 
       // Additional placement logic...
     };
     
     assets.forEach(placeAsset);
     return structure;
   };
   ```

2. `handleMediaSelect`: Updates the database when a media asset is selected:
   ```typescript
   const handleMediaSelect = async (cloudinaryId: string) => {
     // Update database with new assignment
     const response = await fetch('/api/site/media-assets', {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         placeholder_id: selectedPlaceholderId,
         cloudinary_id: cloudinaryId,
       }),
     });
     // Handle response and update UI
   };
   ```

3. `createNewPlaceholder`: Creates a new media placeholder:
   ```typescript
   const createNewPlaceholder = async () => {
     // Form validation
     if (!newPlaceholder.element) return;
     
     // Generate placeholder ID
     const placeholderId = `${newPlaceholder.page}${newPlaceholder.section ? `-${newPlaceholder.section}` : ''}-${newPlaceholder.element}`;
     
     // Create placeholder in database
     const response = await fetch('/api/media/assets/create', {
       method: 'POST',
       body: JSON.stringify({
         placeholder_id: placeholderId,
         cloudinary_id: null,
         metadata: { ... },
       }),
     });
     // Handle response and update UI
   };
   ```

### Search and Filter Implementation

The search functionality utilizes React's `useMemo` hook for efficient filtering:

```typescript
const filteredStructure = React.useMemo(() => {
  if (!searchTerm) return structure;
  
  // Deep clone the structure
  const filtered = JSON.parse(JSON.stringify(structure));
  
  // Recursive filtering function
  const filterCategory = (category: any): boolean => {
    // Filter items at this level
    // Filter children recursively
    // Return true if any matches found
  };
  
  // Apply filter to all top-level categories
  Object.entries(filtered).forEach(([key, category]: [string, any]) => {
    const keepCategory = filterCategory(category);
    if (!keepCategory) {
      delete filtered[key];
    }
  });
  
  return filtered;
}, [structure, searchTerm]);
```

### Cloudinary Integration

The system uses the CloudinaryUploader component for media uploads, which:
1. Opens a media selection interface
2. Handles the upload to Cloudinary
3. Returns the media identifier for storage in the database
4. Associates the media with the selected placeholder

## Future Improvements

Potential enhancements to the system could include:
- Batch operations for media management
- Usage tracking to identify unused placeholders
- Automatic image optimization suggestions
- Version history for media assets
- Drag-and-drop organization

---

*This documentation was last updated on: March 11, 2025 (22:14 PST)* 