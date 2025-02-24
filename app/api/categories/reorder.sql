-- Add order column if it doesn't exist
ALTER TABLE article_categories ADD COLUMN IF NOT EXISTS "order_position" INTEGER DEFAULT 0;

-- Create type for category order
CREATE TYPE category_order AS (
  id UUID,
  order_position INTEGER
);

-- Create function to reorder categories
CREATE OR REPLACE FUNCTION reorder_categories(category_orders category_order[])
RETURNS void AS $$
BEGIN
  -- Update each category's order in a transaction
  FOR i IN 1..array_length(category_orders, 1) LOOP
    UPDATE article_categories
    SET "order_position" = (category_orders[i]).order_position
    WHERE id = (category_orders[i]).id;
  END LOOP;
END;
$$ LANGUAGE plpgsql; 