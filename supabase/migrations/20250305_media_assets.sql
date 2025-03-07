-- Create media_assets table to store associations between placeholder IDs and Cloudinary public IDs
CREATE TABLE IF NOT EXISTS media_assets (
  placeholder_id TEXT PRIMARY KEY,
  cloudinary_id TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  uploaded_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create media_placeholders table to store information about media placeholders
CREATE TABLE IF NOT EXISTS media_placeholders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  area TEXT NOT NULL,
  path TEXT NOT NULL,
  dimensions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_media_placeholders_updated_at
BEFORE UPDATE ON media_placeholders
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_media_assets_cloudinary_id ON media_assets(cloudinary_id);
CREATE INDEX IF NOT EXISTS idx_media_placeholders_area ON media_placeholders(area);
CREATE INDEX IF NOT EXISTS idx_media_placeholders_path ON media_placeholders(path); 