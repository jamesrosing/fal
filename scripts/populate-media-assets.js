import dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- Configuration ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
// Define path directly, not from env var
const PLACEHOLDER_MAP_FILE = path.resolve(process.cwd(), 'placeholder_map.json');

// Basic validation - remove PLACEHOLDER_MAP_FILE from check
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error('Error: Missing required environment variables (Supabase URL/Service Key, Cloudinary Cloud Name/API Key/Secret).');
    process.exit(1);
}

// Configure Cloudinary SDK
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true, // Use https
});

// Initialize Supabase Client
const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Helper Functions ---

/**
 * Derives the Cloudinary public_id from a placeholder name.
 * Basic assumption: remove the file extension.
 * Adjust if your naming convention differs.
 */
function getCloudinaryPublicId(placeholderName) {
    const lastDotIndex = placeholderName.lastIndexOf('.');
    if (lastDotIndex > 0) {
        return placeholderName.substring(0, lastDotIndex);
    }
    return placeholderName; // Return as-is if no extension found
}

/**
 * Fetches asset details from Cloudinary, trying both image and video types.
 */
async function getCloudinaryAssetDetails(publicId) {
    let cloudinaryAsset = null;
    let assetError = null;

    try {
        // Try IMAGE first
        console.log(`  - Attempting to fetch \"${publicId}\" as image...`);
        cloudinaryAsset = await cloudinary.api.resource(publicId, { resource_type: 'image' });
        console.log(`  - Found as image.`);
    } catch (error) {
        if (error.http_code === 404 || error?.error?.message?.includes('Resource not found')) {
            // Not found as image, try as VIDEO
            console.log(`  - Not found as image. Attempting as video...`);
            try {
                cloudinaryAsset = await cloudinary.api.resource(publicId, { resource_type: 'video' });
                console.log(`  - Found as video.`);
            } catch (videoError) {
                if (videoError.http_code === 404 || videoError?.error?.message?.includes('Resource not found')) {
                    assetError = new Error(`Asset not found as image or video.`); // Specific error
                } else {
                    assetError = videoError; // Different error fetching video
                }
            }
        } else {
            assetError = error; // Different error fetching image
        }
    }
    return { cloudinaryAsset, assetError };
}

// --- Main Script Logic ---

async function populateMediaAssetsAndMappings() {
    console.log('Starting script to populate media assets and mappings...');

    // 1. Read the placeholder map file
    let placeholderMap; // Declare placeholderMap here
    try {
        console.log(`Reading placeholder map from ${PLACEHOLDER_MAP_FILE}...`);
        const mapData = await fs.readFile(PLACEHOLDER_MAP_FILE, 'utf8');
        placeholderMap = JSON.parse(mapData);
        console.log(`Successfully loaded ${Object.keys(placeholderMap).length} mappings.`);
    } catch (err) {
        console.error(`Error reading or parsing ${PLACEHOLDER_MAP_FILE}:`, err.message);
        process.exit(1);
    }

    // 2. Fetch existing media_assets (cloudinary_id -> media_id) for efficiency
    console.log('\nFetching existing media_assets from Supabase...');
    const { data: existingDbAssets, error: existingAssetsError } = await supabase
        .from('media_assets')
        .select('id, cloudinary_id');

    if (existingAssetsError) {
        console.error('Error fetching existing media_assets:', existingAssetsError.message);
        return;
    }
    const existingAssetsMap = new Map(existingDbAssets?.map(a => [a.cloudinary_id, a.id]) || []);
    console.log(`Found ${existingAssetsMap.size} existing assets.`);

    // 3. Fetch existing placeholders (name -> placeholder_id) for efficiency
    console.log('\nFetching existing placeholders from Supabase...');
     const { data: existingDbPlaceholders, error: existingPlaceholdersError } = await supabase
        .from('unified_media_placeholders')
        .select('id, name');

    if (existingPlaceholdersError) {
        console.error('Error fetching existing unified_media_placeholders:', existingPlaceholdersError.message);
        return;
    }
    const existingPlaceholdersMap = new Map(existingDbPlaceholders?.map(p => [p.name, p.id]) || []);
    console.log(`Found ${existingPlaceholdersMap.size} existing placeholders.`);

    let assetsInsertedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    let placeholderNotFoundCount = 0;

    // 4. Process each entry in the placeholder map
    console.log('\nProcessing placeholder map entries:');
    for (const [placeholderName, cloudinaryPublicIdValue] of Object.entries(placeholderMap)) {
        console.log(`\n- Processing mapping: "${placeholderName}" => "${cloudinaryPublicIdValue}"`);

        // Use the value from the map directly
        const cloudinaryPublicId = cloudinaryPublicIdValue;

        // 4a. Find the placeholder ID in Supabase
        const placeholderId = existingPlaceholdersMap.get(placeholderName);
        if (!placeholderId) {
            console.warn(`  - Warning: Placeholder name "${placeholderName}" not found in unified_media_placeholders table. Skipping mapping.`);
            placeholderNotFoundCount++;
            continue;
        }

        if (!existingAssetsMap.has(cloudinaryPublicId)) {
            console.log(`  - Asset "${cloudinaryPublicId}" not in DB cache. Fetching from Cloudinary...`);
            // Pass the correct publicId from the map to the fetch function
            const { cloudinaryAsset, assetError } = await getCloudinaryAssetDetails(cloudinaryPublicId);

            if (assetError) {
                console.error(`  - Error fetching asset "${cloudinaryPublicId}" from Cloudinary:`, assetError.message);
                errorCount++;
                continue;
            }

            // 5. Prepare data for Supabase insert
            const assetData = {
                id: uuidv4(),
                cloudinary_id: cloudinaryAsset.public_id,
                type: cloudinaryAsset.resource_type === 'video' ? 'video' : 'image',
                title: placeholderName, // Use placeholder name as title
                alt_text: placeholderName, // Use placeholder name as alt text
                metadata: { // Add some basic metadata
                    original_filename: placeholderName,
                    bytes: cloudinaryAsset.bytes,
                    secure_url: cloudinaryAsset.secure_url
                },
                width: cloudinaryAsset.width,
                height: cloudinaryAsset.height,
                format: cloudinaryAsset.format,
                url: cloudinaryAsset.secure_url,
            };

            // 6. Insert into media_assets
            console.log(`  - Inserting asset into media_assets...`);
            const { data: insertedAsset, error: insertError } = await supabase
                .from('media_assets')
                .insert(assetData)
                .single(); // Expect a single row

            if (insertError) {
                console.error(`  - Error inserting asset for "${cloudinaryPublicId}":`, insertError.message);
                errorCount++;
            } else {
                console.log(`  - Successfully inserted asset for "${cloudinaryPublicId}" into media_assets.`);
                assetsInsertedCount++;
            }
        } else {
            console.log(`  - Found existing asset in DB. Media ID: ${existingAssetsMap.get(cloudinaryPublicId)}`);
            // Optionally, add logic here to *update* the existing asset if needed
        }
    }

    // 7. Log summary
    console.log('\n--- Script Summary ---');
    console.log(`Total mappings processed from map file: ${Object.keys(placeholderMap).length}`);
    console.log(`Placeholders not found in DB: ${placeholderNotFoundCount}`);
    console.log(`Assets successfully inserted: ${assetsInsertedCount}`);
    console.log(`Assets already existing (skipped): ${skippedCount}`);
    console.log(`Assets not found in Cloudinary: ${notFoundCount}`);
    console.log(`Errors during processing: ${errorCount}`);
    console.log('--------------------\n');
}

// Run the script
populateMediaAssetsAndMappings()
    .then(() => console.log('Script finished.'))
    .catch(err => {
        console.error('\nUnhandled error executing script:', err);
        process.exit(1);
    }); 