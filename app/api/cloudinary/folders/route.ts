import { NextRequest, NextResponse } from 'next/server';

// Edge runtime
export const runtime = 'edge';

interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!apiKey || !apiSecret || !cloudName) {
      return NextResponse.json(
        { error: 'Missing Cloudinary credentials' },
        { status: 500 }
      );
    }
    
    // Authentication for Cloudinary API
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Fetch all folders recursively
    const allFolders: string[] = [];
    
    // Function to recursively get all subfolders
    const fetchFoldersRecursively = async (parentPath: string = '') => {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/folders${parentPath ? '/' + parentPath : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch folders: ${response.status}`);
      }
      
      const data = await response.json();
      const folders = data.folders || [];
      
      // Add current folders to the list
      for (const folder of folders) {
        const path = parentPath ? `${parentPath}/${folder.name}` : folder.name;
        allFolders.push(path);
        
        // Recursively fetch subfolders
        await fetchFoldersRecursively(path);
      }
    };
    
    // Start fetching folders from root
    await fetchFoldersRecursively();
    
    // Build folder tree
    const buildFolderTree = (folders: string[]): FolderStructure[] => {
      const root: FolderStructure[] = [];
      const map: Record<string, FolderStructure> = {};
      
      // First pass: create nodes for all folders
      folders.forEach(path => {
        const parts = path.split('/');
        const name = parts[parts.length - 1];
        
        // Create node for current folder
        map[path] = {
          name,
          path,
          children: []
        };
        
        // Create nodes for all parent folders if they don't exist
        let currentPath = '';
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          if (!map[currentPath]) {
            map[currentPath] = {
              name: part,
              path: currentPath,
              children: []
            };
          }
        }
      });
      
      // Second pass: build tree by adding children to parents
      folders.forEach(path => {
        const parts = path.split('/');
        
        if (parts.length === 1) {
          // Root folder
          root.push(map[path]);
        } else {
          // Add as child to parent
          const parentPath = parts.slice(0, parts.length - 1).join('/');
          if (map[parentPath]) {
            map[parentPath].children.push(map[path]);
          }
        }
      });
      
      // Sort tree by name
      const sortTree = (node: FolderStructure) => {
        node.children.sort((a, b) => a.name.localeCompare(b.name));
        node.children.forEach(sortTree);
      };
      
      root.sort((a, b) => a.name.localeCompare(b.name));
      root.forEach(sortTree);
      
      return root;
    };
    
    // Standard areas to prioritize at the top
    const standardAreas = ['hero', 'gallery', 'team', 'article', 'service', 'logo', 'video-thumbnail'];
    
    // Get top-level folders (areas) and move standard areas to the top
    let folderTree = buildFolderTree(allFolders);
    
    // Sort so that standard areas appear first
    folderTree.sort((a, b) => {
      const aIsStandard = standardAreas.includes(a.name);
      const bIsStandard = standardAreas.includes(b.name);
      
      if (aIsStandard && !bIsStandard) return -1;
      if (!aIsStandard && bIsStandard) return 1;
      
      // If both are standard areas, sort by their position in the standardAreas array
      if (aIsStandard && bIsStandard) {
        return standardAreas.indexOf(a.name) - standardAreas.indexOf(b.name);
      }
      
      // Otherwise, sort alphabetically
      return a.name.localeCompare(b.name);
    });
    
    return NextResponse.json({
      success: true,
      folderStructure: folderTree,
      totalFolders: allFolders.length
    });
  } catch (error) {
    console.error('Error fetching Cloudinary folders:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch folders',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 