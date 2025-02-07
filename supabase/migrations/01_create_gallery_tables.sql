BEGIN;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS galleries CASCADE;

-- Create galleries table
CREATE TABLE galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create albums table
CREATE TABLE albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cases table
CREATE TABLE cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create images table
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  caption TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT images_case_url_key UNIQUE(case_id, cloudinary_url)
);

-- Create indexes for better query performance
CREATE INDEX idx_albums_gallery_id ON albums(gallery_id);
CREATE INDEX idx_cases_album_id ON cases(album_id);
CREATE INDEX idx_images_case_id ON images(case_id);
CREATE INDEX idx_images_tags ON images USING GIN(tags);
CREATE INDEX idx_albums_title_lower ON albums (LOWER(title));

DO $$
BEGIN
  -- Insert initial data for galleries
  INSERT INTO galleries (title, description)
  VALUES
    ('plastic-surgery', 'Plastic Surgery Before & After Gallery'),
    ('emsculpt', 'Emsculpt Body Sculpting Results'),
    ('sylfirmx', 'SylfirmX Skin Rejuvenation Results'),
    ('facials', 'Facial Treatment Results');

  -- Insert initial data for plastic surgery albums
  INSERT INTO albums (gallery_id, title, description)
  SELECT 
    g.id,
    t.album_title,
    'Before & After Gallery'
  FROM galleries g
  CROSS JOIN (
    VALUES
      ('face'), ('eyelids'), ('ears'), ('nose'), ('neck'),
      ('breast-augmentation'), ('breast-lift'), ('breast-reduction'),
      ('breast-revision'), ('breast-nipple-areolar-complex'),
      ('abdominoplasty'), ('mini-abdominoplasty'),
      ('liposuction'), ('arm-lift'), ('thigh-lift')
  ) AS t(album_title)
  WHERE g.title = 'plastic-surgery';

  -- Insert initial data for emsculpt albums
  INSERT INTO albums (gallery_id, title, description)
  SELECT 
    g.id,
    t.album_title,
    'Before & After Gallery'
  FROM galleries g
  CROSS JOIN (
    VALUES
      ('Abdomen'), ('Buttocks'), ('Arms'), ('Calves')
  ) AS t(album_title)
  WHERE g.title = 'emsculpt';

  -- Insert initial data for sylfirmx albums
  INSERT INTO albums (gallery_id, title, description)
  SELECT 
    g.id,
    'skin-rejuvenation',
    'Before & After Gallery'
  FROM galleries g
  WHERE g.title = 'sylfirmx';

  -- Insert initial data for facials albums
  INSERT INTO albums (gallery_id, title, description)
  SELECT 
    g.id,
    'treatments',
    'Before & After Gallery'
  FROM galleries g
  WHERE g.title = 'facials';

  RAISE NOTICE 'All data inserted successfully';
END $$;

COMMIT;