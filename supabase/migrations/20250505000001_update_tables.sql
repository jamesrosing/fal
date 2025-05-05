-- Add category_id column to articles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'articles' 
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE "public"."articles" ADD COLUMN "category_id" uuid;
  END IF;
END
$$; 