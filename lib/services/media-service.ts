import { createServerClient, createBrowserClient, createActionClient } from '@/lib/supabase-client'; // Adjust path if necessary
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { cache } from 'react';
import { Database } from '@/lib/database.types'; // Assuming types are here

// Re-export Supabase types if needed elsewhere, or import directly
export type MediaAssetRow = Database['public']['Tables']['media_assets']['Row'];
export type MediaMappingRow = Database['public']['Tables']['media_mappings']['Row'];
export type MediaAssetInsert = Database['public']['Tables']['media_assets']['Insert'];
export type MediaMappingInsert = Database['public']['Tables']['media_mappings']['Insert'];

// Extend Row type to include potential relations if needed later
export interface MediaAsset extends MediaAssetRow {}
export interface MediaMapping extends MediaMappingRow {}

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  transformation?: Record<string, any>;
  eager?: Record<string, any>[];
  resource_type?: 'image' | 'raw' | 'video' | 'auto';
  // Add other Cloudinary upload options as needed
}

export class MediaService {
  // private supabaseServer = createServerClient(); // Cannot instantiate server client here directly
  // Note: Choose the correct client based on context (server, client, action)
  // Consider passing the client instance if service is used across different contexts

  constructor(private config = {}) {
    // Configure cloudinary - Ensure these ENV vars are set
    try {
      cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      console.log('MediaService initialized. Cloudinary configured:', !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
      if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          console.warn('MediaService: Cloudinary environment variables (NAME, KEY, SECRET) are not fully set.');
      }
    } catch (error) {
        console.error('MediaService: Error configuring Cloudinary:', error)
    }
  }

  // --- Core Methods ---\

  // Get media by placeholder ID with caching (Server Component context)
  // IMPORTANT: This method should ideally be called from a Server Component
  // where createServerClient() can be properly invoked.
  // Using React's cache function requires the function passed to it to be stable.
  // Defining it directly within the class instance might not guarantee stability across requests.
  // A pattern often used is defining the cached function outside the class or ensuring
  // the service instance itself is cached/singleton per request.

  // For simplicity here, we demonstrate the concept but acknowledge potential issues
  // with caching identity if the service is instantiated multiple times.
  getCachedMediaByPlaceholderId = cache(async (placeholderId: string): Promise<MediaAsset | null> => {
    console.log(`getCachedMediaByPlaceholderId: Fetching mapping for placeholder: ${placeholderId}`);
    // IMPORTANT: Must use a client created for the specific server request context
    const supabase = createServerClient();

    const { data: mapping, error: mappingError } = await supabase
      .from('media_mappings')
      .select('media_id')
      .eq('placeholder_id', placeholderId)
      .single();

    if (mappingError) {
       if (mappingError.code === 'PGRST116') { // 'PGRST116' is "Row not found"
         console.log(`getCachedMediaByPlaceholderId: No mapping found for placeholder ${placeholderId}`);
       } else {
         console.error(`getCachedMediaByPlaceholderId: Error fetching mapping for placeholder ${placeholderId}:`, mappingError);
       }
       return null;
    }

    if (!mapping?.media_id) {
        console.error(`getCachedMediaByPlaceholderId: Mapping found for ${placeholderId}, but media_id is missing.`);
        return null;
    }

    console.log(`getCachedMediaByPlaceholderId: Mapping found, fetching media asset: ${mapping.media_id}`);
    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', mapping.media_id)
      .single();

    if (mediaError || !mediaAsset) {
      console.error(`getCachedMediaByPlaceholderId: Error fetching media asset ${mapping.media_id}:`, mediaError);
      return null;
    }

    console.log(`getCachedMediaByPlaceholderId: Media asset found for ${placeholderId}:`, mediaAsset.id);
    return mediaAsset as MediaAsset;
  });

  // Example: Get all media assets (suitable for Server Action or API Route)
  async getAllMedia(): Promise<MediaAsset[]> {
    const supabase = createActionClient(); // Or createServerClient if in API route
    console.log('getAllMedia: Fetching all media assets...');
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAllMedia: Error fetching media assets:', error);
      return [];
    }

    console.log(`getAllMedia: Found ${data.length} media assets.`);
    return data as MediaAsset[];
  }

  // Example: Upload media (suitable for Server Action)
  async uploadMedia(
    file: File | Buffer | string,
    options: UploadOptions = {}
  ): Promise<MediaAsset | null> {
     const supabase = createActionClient();
     console.log('uploadMedia: Starting upload process...');
    try {
      const uploadResponse = await this.uploadToCloudinary(file, options);

      if (!uploadResponse) {
        console.error('uploadMedia: Cloudinary upload failed or returned no response.');
        return null;
      }
       console.log('uploadMedia: Cloudinary upload successful:', uploadResponse.public_id);

      const mediaAsset = await this.createMediaAssetRecord(supabase, uploadResponse);
       if (mediaAsset) {
           console.log('uploadMedia: Supabase media asset record created:', mediaAsset.id);
       }
      return mediaAsset;
    } catch (error) {
      console.error('uploadMedia: Error uploading media:', error);
      return null;
    }
  }

  // Example: Map media to placeholder (suitable for Server Action)
  async mapMediaToPlaceholder(placeholderId: string, mediaId: string): Promise<boolean> {
    const supabase = createActionClient();
    console.log(`mapMediaToPlaceholder: Attempting to map placeholder '${placeholderId}' to media '${mediaId}'`);

    // Ensure mediaId exists
     const { data: mediaExists, error: mediaCheckError } = await supabase
        .from('media_assets')
        .select('id', { count: 'exact', head: true }) // Efficiently check existence
        .eq('id', mediaId);

    // Check the count property from the result
    if (mediaCheckError || !mediaExists || mediaExists.count === 0) {
        console.error(`mapMediaToPlaceholder: Media asset with ID '${mediaId}' not found. Cannot create mapping. Error:`, mediaCheckError);
        return false;
    }


    // Upsert logic: Insert or update the mapping
    const { error: upsertError } = await supabase
      .from('media_mappings')
      .upsert(
        { placeholder_id: placeholderId, media_id: mediaId },
        { onConflict: 'placeholder_id' } // If placeholder_id exists, update the row
      );

    if (upsertError) {
      console.error(`mapMediaToPlaceholder: Error upserting mapping for placeholder ${placeholderId}:`, upsertError);
      return false;
    }

    console.log(`mapMediaToPlaceholder: Successfully upserted mapping for ${placeholderId}`);
    return true;
  }

  // Example: Delete media (suitable for Server Action)
  async deleteMedia(mediaId: string): Promise<boolean> {
     const supabase = createActionClient();
    console.log(`deleteMedia: Attempting to delete media asset with ID: ${mediaId}`);

    // Get the media asset to find its Cloudinary ID
    const { data: mediaAsset, error: fetchError } = await supabase
      .from('media_assets')
      .select('cloudinary_id, type')
      .eq('id', mediaId)
      .single();

    if (fetchError || !mediaAsset) {
      console.error(`deleteMedia: Error fetching media asset ${mediaId} for deletion:`, fetchError);
      return false;
    }

    console.log(`deleteMedia: Found media asset, Cloudinary ID: ${mediaAsset.cloudinary_id}`);

    // Delete from Cloudinary
    try {
      const resourceType = mediaAsset.type;
      console.log(`deleteMedia: Deleting ${resourceType} from Cloudinary: ${mediaAsset.cloudinary_id}`);
      const deletionResult = await cloudinary.uploader.destroy(mediaAsset.cloudinary_id, { resource_type: resourceType });
      console.log('deleteMedia: Cloudinary deletion result:', deletionResult);
      if (deletionResult.result !== 'ok' && deletionResult.result !== 'not found') {
         console.warn(`deleteMedia: Cloudinary deletion might have failed for ${mediaAsset.cloudinary_id}. Result: ${deletionResult.result}`);
      }
    } catch (error) {
      console.error(`deleteMedia: Error deleting from Cloudinary ${mediaAsset.cloudinary_id}:`, error);
      // Decide if you want to continue with DB delete despite Cloudinary error
    }

    // Delete asset record from Supabase (ON DELETE CASCADE handles mappings)
    console.log(`deleteMedia: Deleting media asset record from Supabase: ${mediaId}`);
    const { error: deleteError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', mediaId);

    if (deleteError) {
      console.error(`deleteMedia: Error deleting media asset ${mediaId} from Supabase:`, deleteError);
      return false;
    }

    console.log(`deleteMedia: Successfully deleted media asset ${mediaId}`);
    return true;
  }

 // --- Helper Methods ---\

  private async uploadToCloudinary(
    file: File | Buffer | string,
    options: UploadOptions = {}
  ): Promise<UploadApiResponse | null> {
    console.log('uploadToCloudinary: Starting Cloudinary upload...');
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('uploadToCloudinary: Cloudinary ENV variables not configured.');
        return null;
    }
    try {
      const uploadOptions = {
        folder: options.folder || 'media',
        tags: options.tags || [],
        resource_type: options.resource_type || 'auto',
        ...options
      };
       console.log('uploadToCloudinary: Upload options:', uploadOptions);

      return await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadCallback = (error: any, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('uploadToCloudinary: Upload callback error:', error);
            reject(error);
          } else if (result) {
             console.log('uploadToCloudinary: Upload callback success.');
            resolve(result);
          } else {
              console.error('uploadToCloudinary: Upload callback returned no result and no error.');
              reject(new Error('Cloudinary upload returned undefined result.'));
          }
        };

        if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://'))) {
           console.log('uploadToCloudinary: Uploading from URL...');
          cloudinary.uploader.upload(file, uploadOptions, uploadCallback);
        } else if (typeof file === 'string' && file.startsWith('data:')) {
           console.log('uploadToCloudinary: Uploading from Base64 data URI...');
           cloudinary.uploader.upload(file, uploadOptions, uploadCallback);
        } else if (file instanceof Buffer) {
           console.log('uploadToCloudinary: Uploading from Buffer...');
          cloudinary.uploader.upload_stream(uploadOptions, uploadCallback).end(file);
        } else if (typeof File !== 'undefined' && file instanceof File) {
           console.log('uploadToCloudinary: Uploading from File object (browser)...');
           const reader = new FileReader();
           reader.onload = () => {
               if (typeof reader.result === 'string') {
                   cloudinary.uploader.upload(reader.result, uploadOptions, uploadCallback);
               } else {
                   reject(new Error('FileReader did not return a string result.'));
               }
           };
           reader.onerror = (err) => {
               console.error('uploadToCloudinary: FileReader error:', err);
               reject(err);
           };
           reader.readAsDataURL(file);
        } else {
             console.error('uploadToCloudinary: Unsupported file type provided.');
             reject(new Error('Unsupported file type for upload.'));
        }
      });
    } catch (error) {
      console.error('uploadToCloudinary: Error during Cloudinary upload process:', error);
      return null;
    }
  }

  private async createMediaAssetRecord(
    supabase: ReturnType<typeof createActionClient>, // Pass client instance
    uploadResponse: UploadApiResponse
  ): Promise<MediaAsset | null> {
    console.log('createMediaAssetRecord: Creating Supabase record for Cloudinary ID:', uploadResponse.public_id);

    if (!uploadResponse.public_id || !uploadResponse.resource_type) {
        console.error('createMediaAssetRecord: Invalid Cloudinary response - missing public_id or resource_type.');
        return null;
    }

    const assetData: MediaAssetInsert = {
      cloudinary_id: uploadResponse.public_id,
      type: uploadResponse.resource_type === 'video' ? 'video' : 'image',
      title: uploadResponse.original_filename || uploadResponse.public_id.split('/').pop(),
      alt_text: (uploadResponse.context as Record<string, string> | undefined)?.alt || uploadResponse.original_filename || '',
      metadata: { /* Filter or structure metadata as needed */
        original_filename: uploadResponse.original_filename,
        format: uploadResponse.format,
        resource_type: uploadResponse.resource_type,
        secure_url: uploadResponse.secure_url,
        bytes: uploadResponse.bytes,
        folder: uploadResponse.folder,
        tags: uploadResponse.tags,
        context: uploadResponse.context as any,
        width: uploadResponse.width,
        height: uploadResponse.height,
        // Potentially add derived data like aspect ratio if useful
      },
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format,
    };

    console.log('createMediaAssetRecord: Inserting asset data:', assetData);

    const { data, error } = await supabase
      .from('media_assets')
      .insert(assetData)
      .select()
      .single();

    if (error) {
      console.error('createMediaAssetRecord: Error inserting media asset record:', error);
      return null;
    }

    if (!data) {
        console.error('createMediaAssetRecord: Insert successful but no data returned.');
        return null;
    }

    console.log('createMediaAssetRecord: Media asset record created successfully:', data.id);
    return data as MediaAsset;
  }

  // --- Optional Advanced Methods ---\

  async generateResponsiveVariants(mediaId: string): Promise<boolean> {
     const supabase = createActionClient();
     console.log(`generateResponsiveVariants: Requesting variants for media ID: ${mediaId}`);

     const { data: mediaAsset, error: fetchError } = await supabase
       .from('media_assets')
       .select('cloudinary_id, type, metadata')
       .eq('id', mediaId)
       .single();

     if (fetchError || !mediaAsset) {
       console.error(`generateResponsiveVariants: Error fetching media asset ${mediaId}:`, fetchError);
       return false;
     }

     if (mediaAsset.type !== 'image') {
        console.log(`generateResponsiveVariants: Skipping non-image asset ${mediaId} (type: ${mediaAsset.type})`);
       return false;
     }

     try {
       const variants = [
         { width: 1920, crop: 'limit', quality: 'auto:good', format: 'auto' },
         { width: 1280, crop: 'limit', quality: 'auto:good', format: 'auto' },
         { width: 768,  crop: 'limit', quality: 'auto:good', format: 'auto' },
         { width: 480,  crop: 'limit', quality: 'auto:eco', format: 'auto' },
       ];

       console.log(`generateResponsiveVariants: Requesting eager transformations for Cloudinary ID: ${mediaAsset.cloudinary_id}`);
       const result = await cloudinary.uploader.explicit(mediaAsset.cloudinary_id, {
         type: 'upload',
         resource_type: 'image',
         eager: variants,
         eager_async: true,
       });

       console.log('generateResponsiveVariants: Cloudinary explicit call result:', result);

        if (result.eager && result.eager.length > 0) {
            console.log(`generateResponsiveVariants: Updating Supabase metadata for ${mediaId} with variant info.`);
            // Ensure metadata is treated as an object, even if null/undefined initially
            const currentMetadata = (typeof mediaAsset.metadata === 'object' && mediaAsset.metadata !== null) ? mediaAsset.metadata : {};
            const updatedMetadata = {
                ...currentMetadata,
                responsive_variants: result.eager.map((variant: Record<string, any>) => ({
                    url: variant.secure_url,
                    width: variant.width,
                    height: variant.height,
                    transformation: variant.transformation
                }))
            };


            const { error: updateError } = await supabase
                .from('media_assets')
                .update({ metadata: updatedMetadata } as Partial<MediaAssetInsert>) // Cast to Partial for update
                .eq('id', mediaId);


            if (updateError) {
                console.error(`generateResponsiveVariants: Error updating media asset ${mediaId} with variants:`, updateError);
            } else {
                 console.log(`generateResponsiveVariants: Successfully updated metadata for ${mediaId}`);
            }
        } else {
             console.log(`generateResponsiveVariants: No eager variants returned immediately (possibly async). Metadata not updated yet.`);
        }

       return true;
     } catch (error) {
       console.error(`generateResponsiveVariants: Error during Cloudinary explicit call for ${mediaAsset.cloudinary_id}:`, error);
       return false;
     }
  }

}

// Consider exporting an instance if appropriate for your context,
// but be mindful of Supabase client scope (server vs client).
// export const mediaService = new MediaService();
