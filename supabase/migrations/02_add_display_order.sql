-- Add display_order column to images table
ALTER TABLE images ADD COLUMN display_order SERIAL;

-- Create a function to update display_order for new images
CREATE OR REPLACE FUNCTION set_images_display_order()
RETURNS TRIGGER AS $$
DECLARE
  max_order INT;
BEGIN
  -- Find the maximum display_order for the case
  SELECT COALESCE(MAX(display_order), 0) INTO max_order
  FROM images
  WHERE case_id = NEW.case_id;
  
  -- Set the new image's display_order to be one more than the maximum
  NEW.display_order := max_order + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set display_order for new images
CREATE TRIGGER images_set_display_order
BEFORE INSERT ON images
FOR EACH ROW
EXECUTE FUNCTION set_images_display_order();

-- Initialize display orders for existing images
DO $$
DECLARE
  case_rec RECORD;
  img_rec RECORD;
  order_counter INT;
BEGIN
  -- Loop through each case
  FOR case_rec IN SELECT DISTINCT case_id FROM images LOOP
    order_counter := 1;
    
    -- For each image in the case, set its display_order based on created_at
    FOR img_rec IN 
      SELECT id 
      FROM images 
      WHERE case_id = case_rec.case_id 
      ORDER BY created_at ASC
    LOOP
      UPDATE images 
      SET display_order = order_counter 
      WHERE id = img_rec.id;
      
      order_counter := order_counter + 1;
    END LOOP;
  END LOOP;
END $$; 