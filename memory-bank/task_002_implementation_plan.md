# Task 2: Database Schema Implementation Plan

## Overview
This document outlines the detailed approach for implementing the database schema as specified in the PRD while preserving existing data.

## Current Schema Analysis

**Existing Tables:**
- `galleries`: Basic structure exists but missing slug and thumbnail_id
- `albums`: Has basic structure but missing cover_image, order_index, and slug
- `cases`: Has basic structure but may need adjustments to metadata and additional fields
- `images`: Similar to case_images but needs renaming and structure adjustment
- `media_assets`: Current structure differs from PRD, uses cloudinary_id instead of public_id
- `media_placeholders`: Used in the current placeholder system, will be phased out

## Required Schema Changes

### 1. media_assets Table
**Current Structure:**
```sql
CREATE TABLE media_assets (
  placeholder_id TEXT PRIMARY KEY,
  cloudinary_id TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  uploaded_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

**Target Structure (PRD):**
```sql
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  title TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  format TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT media_assets_public_id_key UNIQUE (public_id)
);
```

### 2. galleries Table
**Current Structure:**
```sql
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Target Structure (PRD):**
```sql
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_id UUID REFERENCES media_assets(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. albums Table
**Current Structure:**
```sql
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Target Structure (PRD):**
```sql
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  thumbnail_id UUID REFERENCES media_assets(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gallery_id, slug)
);
```

### 4. cases Table
**Current Structure:**
```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Target Structure (PRD):**
```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (album_id, slug)
);
```

### 5. images to case_images Table
**Current Structure:**
```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  cloudinary_url TEXT NOT NULL,
  caption TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INTEGER DEFAULT nextval('images_display_order_seq'::regclass) NOT NULL
);
```

**Target Structure (PRD):**
```sql
CREATE TABLE case_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, sequence)
);
```

## Migration Strategy

### Phase 1: Backup Current Data
1. Create a backup of all current data in affected tables
2. Generate scripts to recreate data if migration fails

### Phase 2: Create New Structure in Parallel
1. Create new `temp_media_assets` table with PRD structure
2. Create temporary junction tables for migration if needed

### Phase 3: Data Migration
1. **Media Assets Migration**:
   - Create script to populate `temp_media_assets` from existing data
   - Map `cloudinary_id` to `public_id` and extract metadata

2. **Modify Existing Tables**:
   - Add missing columns to `galleries`, `albums`, `cases`
   - Generate slugs from titles for records missing slugs
   - Set default values for new required fields

3. **Images to case_images Migration**:
   - Create new `case_images` table
   - Create media_assets entries for each image
   - Create case_images entries referencing the new media_assets

### Phase 4: Validate and Switch
1. Verify data integrity and completeness
2. Create and test Row Level Security (RLS) policies
3. Rename temporary tables to final names
4. Update references and foreign keys

### Phase 5: Cleanup
1. Remove deprecated tables and fields
2. Create new indexes for optimized querying
3. Document the new schema

## SQL Migration Scripts

### 1. Backup Current Data
```sql
CREATE TABLE backup_galleries AS SELECT * FROM galleries;
CREATE TABLE backup_albums AS SELECT * FROM albums;
CREATE TABLE backup_cases AS SELECT * FROM cases;
CREATE TABLE backup_images AS SELECT * FROM images;
CREATE TABLE backup_media_assets AS SELECT * FROM media_assets;
CREATE TABLE backup_media_placeholders AS SELECT * FROM media_placeholders;
```

### 2. Create New Media Assets Table
```sql
CREATE TABLE temp_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  title TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  format TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT temp_media_assets_public_id_key UNIQUE (public_id)
);

-- Populate from existing data
INSERT INTO temp_media_assets (public_id, type, title, alt_text, metadata, created_at)
SELECT 
  cloudinary_id as public_id,
  CASE WHEN cloudinary_id LIKE '%video%' THEN 'video' ELSE 'image' END as type,
  COALESCE(metadata->>'title', placeholder_id) as title,
  COALESCE(metadata->>'alt_text', placeholder_id) as alt_text,
  metadata,
  uploaded_at as created_at
FROM media_assets;
```

### 3. Update Galleries Table
```sql
-- Add missing columns
ALTER TABLE galleries 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_id UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Generate slugs
UPDATE galleries 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g'))
WHERE slug IS NULL;

-- Add constraints
ALTER TABLE galleries 
ADD CONSTRAINT galleries_slug_key UNIQUE (slug);

-- Add foreign key to media_assets
ALTER TABLE galleries
ADD CONSTRAINT galleries_thumbnail_id_fkey 
FOREIGN KEY (thumbnail_id) REFERENCES temp_media_assets(id);
```

### 4. Update Albums Table
```sql
-- Add missing columns
ALTER TABLE albums 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_id UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Generate slugs
UPDATE albums 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g'))
WHERE slug IS NULL;

-- Add constraints
ALTER TABLE albums 
ADD CONSTRAINT albums_gallery_id_slug_key UNIQUE (gallery_id, slug);

-- Add foreign key to media_assets
ALTER TABLE albums
ADD CONSTRAINT albums_thumbnail_id_fkey 
FOREIGN KEY (thumbnail_id) REFERENCES temp_media_assets(id);

-- Modify existing foreign key to add CASCADE
ALTER TABLE albums
DROP CONSTRAINT albums_gallery_id_fkey,
ADD CONSTRAINT albums_gallery_id_fkey 
FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE;
```

### 5. Update Cases Table
```sql
-- Add missing columns
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Generate slugs
UPDATE cases 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g'))
WHERE slug IS NULL;

-- Add constraints
ALTER TABLE cases 
ADD CONSTRAINT cases_album_id_slug_key UNIQUE (album_id, slug);

-- Modify existing foreign key to add CASCADE
ALTER TABLE cases
DROP CONSTRAINT cases_album_id_fkey,
ADD CONSTRAINT cases_album_id_fkey 
FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE;
```

### 6. Create Case Images Table
```sql
-- Create case_images table
CREATE TABLE case_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES temp_media_assets(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (case_id, sequence)
);

-- First create media assets for each image
WITH new_media_assets AS (
  INSERT INTO temp_media_assets (public_id, type, title, created_at)
  SELECT 
    REGEXP_REPLACE(cloudinary_url, '^.*/([^/]+)$', '\1') as public_id,
    'image' as type,
    COALESCE(caption, 'Case image') as title,
    created_at
  FROM images
  RETURNING id, case_id, display_order
)
-- Then create case_images entries
INSERT INTO case_images (case_id, media_id, sequence, created_at)
SELECT 
  i.case_id,
  nma.id as media_id,
  i.display_order as sequence,
  i.created_at
FROM images i
JOIN new_media_assets nma ON nma.case_id = i.case_id AND nma.display_order = i.display_order;
```

### 7. Implement Row Level Security
```sql
-- Enable RLS
ALTER TABLE temp_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- For media_assets
CREATE POLICY media_assets_admin_policy ON temp_media_assets
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM user_roles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM user_roles WHERE role = 'admin'));

CREATE POLICY media_assets_read_policy ON temp_media_assets
  FOR SELECT
  TO authenticated
  USING (true);

-- For galleries
CREATE POLICY galleries_admin_policy ON galleries
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM user_roles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM user_roles WHERE role = 'admin'));

CREATE POLICY galleries_read_policy ON galleries
  FOR SELECT
  TO authenticated
  USING (true);

-- Similar policies for albums, cases, and case_images
```

### 8. Rename and Finalize
```sql
-- Rename temp table to final name
ALTER TABLE temp_media_assets RENAME TO media_assets;

-- Drop old images table and related objects
DROP TABLE IF EXISTS images CASCADE;
DROP SEQUENCE IF EXISTS images_display_order_seq;

-- Clean up deprecated tables if no longer needed
-- DROP TABLE IF EXISTS media_placeholders;
```

## Implementation Steps

1. **Development and Testing**:
   - Develop migration scripts in a development environment
   - Test with sample data to ensure proper data preservation
   - Validate that foreign key relationships work correctly
   - Verify that RLS policies function as expected

2. **Production Migration**:
   - Schedule a maintenance window for the migration
   - Create full database backup before starting
   - Execute migration scripts in sequence
   - Verify data integrity after migration
   - Update application code to use new schema

3. **Verification**:
   - Run validation queries to ensure all data was migrated correctly
   - Check that foreign key relationships are maintained
   - Verify that RLS policies are properly applied
   - Test application functionality with the new schema

## Fallback Plan

1. **Quick Rollback**:
   - If issues are detected early in migration, revert changes using transaction rollback
   - If issues are detected after completion, restore from backup

2. **Parallel Operation**:
   - Keep original tables for a period after migration
   - Implement dual-write mechanism if needed during transition
   - Switch to new schema only after thorough testing

## Success Criteria

1. All existing data preserved in new schema format
2. Foreign key relationships maintain data integrity
3. RLS policies properly secure data access
4. Application functions correctly with new schema
5. Query performance meets or exceeds previous schema 