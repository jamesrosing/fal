import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';

// Remove edge runtime - Cloudinary SDK requires Node.js runtime
// export const runtime = 'edge';

interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
}

interface CloudinaryFolder {
  name: string;
  path: string;
  subfolders?: CloudinaryFolder[];
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function GET(request: NextRequest) {
  try {
    // Get all folders from Cloudinary
    const result = await cloudinary.api.root_folders();
    const folders = result.folders || [];
    
    // Recursively get subfolders
    const foldersWithSubfolders = await Promise.all(
      folders.map(async (folder: any) => {
        return {
          name: folder.name,
          path: folder.path,
          subfolders: await getSubfolders(folder.path)
        };
      })
    );
    
    // Build folder tree
    const folderTree = buildFolderTree(foldersWithSubfolders.map((folder: CloudinaryFolder) => folder.path));
    
    // Standard areas to prioritize at the top
    const standardAreas = ['hero', 'gallery', 'team', 'article', 'service', 'logo', 'video-thumbnail'];
    
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
      totalFolders: foldersWithSubfolders.length
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    
    // Verify authentication
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session || !sessionData.session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create folders' },
        { status: 401 }
      );
    }
    
    // Verify admin role
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'You must be an admin to create folders' },
        { status: 403 }
      );
    }
    
    // Get folder path from request
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }
    
    // Create the folder in Cloudinary
    const result = await cloudinary.api.create_folder(path);
    
    return NextResponse.json({
      message: 'Folder created successfully',
      folder: result
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

// Helper function to recursively get subfolders
async function getSubfolders(path: string): Promise<CloudinaryFolder[]> {
  try {
    const result = await cloudinary.api.sub_folders(path);
    const folders = result.folders || [];
    
    if (!folders || folders.length === 0) {
      return [];
    }
    
    return await Promise.all(
      folders.map(async (folder: any) => {
        return {
          name: folder.name,
          path: folder.path,
          subfolders: await getSubfolders(folder.path)
        };
      })
    );
  } catch (error) {
    console.error(`Error fetching subfolders for ${path}:`, error);
    return [];
  }
}

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