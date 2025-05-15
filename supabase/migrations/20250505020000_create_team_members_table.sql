-- Create team_members table
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') THEN
    CREATE TABLE IF NOT EXISTS "public"."team_members" (
      "id" uuid PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "title" text,
      "role" text,
      "image_url" text,
      "description" text,
      "order" text,  
      "is_provider" text,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    );
    
    -- Create index on order column for better performance when sorting
    CREATE INDEX idx_team_members_order ON "public"."team_members" ("order");
  END IF;
END
$$; 