# Fix Duplicate IDs in Media Map

This script fixes duplicate placeholder IDs in the media map data by appending a unique suffix to each duplicate.

## Problem

The media map contains duplicate placeholder IDs, which causes React key errors when rendering components that use these IDs. The script found 15 duplicate IDs in the media map.

## Solution

The `fix-duplicate-ids.js` script:

1. Scans the media map data file for duplicate placeholder IDs
2. Fixes duplicates by appending a unique suffix to each duplicate ID
3. Updates the media map data file with the fixed IDs
4. Updates the corresponding records in the Supabase database

## Usage

Run the script using npm:

```bash
npm run fix-duplicate-ids
```

Or directly:

```bash
node scripts/fix-duplicate-ids.js
```

## How It Works

1. The script reads the media map data file from `app/api/site/media-map/data.json`
2. It traverses the media map structure to find all placeholder IDs
3. For each duplicate ID, it keeps the first occurrence unchanged and modifies subsequent occurrences
4. New IDs are created by appending a path-based suffix to ensure uniqueness
5. The script updates both the local media map file and the Supabase database tables:
   - `media_placeholders` table: Updates the `id` field
   - `media_assets` table: Updates the `placeholder_id` field

## Requirements

- Node.js
- Access to Supabase (requires environment variables in `.env.local`)
- The media map data file must exist (run `npm run generate-media-map` if needed)

## Environment Variables

The script requires the following environment variables in your `.env.local` file:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (with write access) 