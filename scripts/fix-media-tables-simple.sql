-- Drop the existing tables if they exist
DROP TABLE IF EXISTS media_assets CASCADE;
DROP TABLE IF EXISTS media_placeholders CASCADE;

-- Create media_assets table
CREATE TABLE media_assets (
  placeholder_id TEXT PRIMARY KEY,
  cloudinary_id TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  uploaded_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create media_placeholders table
CREATE TABLE media_placeholders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  area TEXT NOT NULL,
  path TEXT NOT NULL,
  dimensions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_media_assets_cloudinary_id ON media_assets(cloudinary_id);
CREATE INDEX idx_media_placeholders_area ON media_placeholders(area);
CREATE INDEX idx_media_placeholders_path ON media_placeholders(path);

-- Create function for updating timestamps
DROP FUNCTION IF EXISTS update_modified_column CASCADE;
CREATE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_media_placeholders_updated_at
BEFORE UPDATE ON media_placeholders
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 