'use server';

import 'server-only';
import cloudinary from './cloudinary-server';
import { OrganizeOptions } from './cloudinary';

/**
 * Server-side function for organizing assets with tags, folders, and context
 */
export async function organizeAssets(options: OrganizeOptions) {
  const { publicIds, folder, tags, context, addTags = true } = options;

  try {
    const promises = publicIds.map(async (publicId) => {
      // Move to folder if specified
      if (folder) {
        await cloudinary.uploader.rename(
          publicId,
          `${folder}/${publicId.split('/').pop()}`,
          { overwrite: true }
        );
      }

      // Update tags and context
      const updateOptions: any = {};
      
      if (tags && tags.length > 0) {
        updateOptions[addTags ? 'add_tags' : 'tags'] = tags;
      }
      
      if (context) {
        updateOptions.context = context;
      }
      
      if (Object.keys(updateOptions).length > 0) {
        return cloudinary.uploader.explicit(publicId, updateOptions);
      }
    });

    return Promise.all(promises);
  } catch (error) {
    console.error('Error organizing Cloudinary assets:', error);
    throw error;
  }
}

/**
 * Server-side function to create a collection from a tag or folder
 */
export async function createCollection(name: string, tag?: string, folder?: string) {
  try {
    // First check if collection exists
    const { collections } = await cloudinary.api.root_folders();
    const existingCollection = collections.find((c: any) => c.name === name);
    
    if (existingCollection) {
      return existingCollection;
    }
    
    // Create a new collection with the given name
    let response;
    if (tag) {
      // Create collection based on tag
      response = await cloudinary.api.create_folder(name, {
        resource_type: 'image',
        type: 'upload',
        prefix: `${tag}/`
      });
    } else if (folder) {
      // Create collection based on folder
      response = await cloudinary.api.create_folder(name, {
        resource_type: 'image',
        type: 'upload',
        prefix: `${folder}/`
      });
    } else {
      // Create empty collection
      response = await cloudinary.api.create_folder(name);
    }
    
    return response;
  } catch (error) {
    console.error('Error creating Cloudinary collection:', error);
    throw error;
  }
} 