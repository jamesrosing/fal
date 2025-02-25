-- Create a function to update multiple image orders in a single call
CREATE OR REPLACE FUNCTION update_image_orders(image_orders jsonb)
RETURNS void AS $$
DECLARE
  img jsonb;
BEGIN
  FOR img IN SELECT * FROM jsonb_array_elements(image_orders)
  LOOP
    UPDATE images
    SET display_order = (img->>'display_order')::int
    WHERE id = (img->>'id')::uuid;
  END LOOP;
END;
$$ LANGUAGE plpgsql; 