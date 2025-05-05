-- Create article_categories table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'article_categories') THEN
    -- Table exists, check for slug column
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'article_categories' AND column_name = 'slug') THEN
      ALTER TABLE "public"."article_categories" ADD COLUMN "slug" text;
    END IF;
  ELSE
    -- Create table if it doesn't exist
    CREATE TABLE "public"."article_categories" (
      "id" uuid PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "slug" text NOT NULL,
      "description" text,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now(),
      "order_position" text
    );
  END IF;
END
$$;

-- Create article_subcategories table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'article_subcategories') THEN
    -- Table exists, check for slug column
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'article_subcategories' AND column_name = 'slug') THEN
      ALTER TABLE "public"."article_subcategories" ADD COLUMN "slug" text;
    END IF;
  ELSE
    -- Create table if it doesn't exist
    CREATE TABLE "public"."article_subcategories" (
      "id" uuid PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "slug" text NOT NULL,
      "description" text,
      "category_id" uuid REFERENCES "public"."article_categories"("id"),
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    );
  END IF;
END
$$;

-- Create articles table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'articles') THEN
    -- Table exists, check for slug column
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'articles' AND column_name = 'slug') THEN
      ALTER TABLE "public"."articles" ADD COLUMN "slug" text;
    END IF;
    -- Check for category_id column
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'articles' AND column_name = 'category_id') THEN
      ALTER TABLE "public"."articles" ADD COLUMN "category_id" uuid;
    END IF;
    -- Check for subcategory column
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'articles' AND column_name = 'subcategory') THEN
      ALTER TABLE "public"."articles" ADD COLUMN "subcategory" uuid;
    END IF;
  ELSE
    -- Create table if it doesn't exist
    CREATE TABLE "public"."articles" (
      "id" uuid PRIMARY KEY NOT NULL,
      "title" text NOT NULL,
      "subtitle" text,
      "slug" text,
      "content" jsonb,
      "excerpt" text,
      "author_id" uuid,
      "category_id" uuid,
      "status" text DEFAULT 'draft',
      "featured_image" text,
      "featured_video" text,
      "meta_description" text,
      "meta_keywords" text,
      "published_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now(),
      "reading_time" integer,
      "tags" text,
      "subcategory" uuid
    );
  END IF;
END
$$;

-- Create cases table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cases') THEN
    -- Table exists, check for slug column
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cases' AND column_name = 'slug') THEN
      ALTER TABLE "public"."cases" ADD COLUMN "slug" text;
    END IF;
  ELSE
    -- Create table if it doesn't exist
    CREATE TABLE "public"."cases" (
      "id" uuid PRIMARY KEY NOT NULL,
      "album_id" uuid,
      "title" text,
      "description" text,
      "metadata" jsonb DEFAULT '{}'::jsonb,
      "created_at" timestamp with time zone DEFAULT now(),
      "slug" text,
      "updated_at" timestamp with time zone DEFAULT now()
    );
  END IF;
END
$$;

-- Create case_images table
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'case_images') THEN
    CREATE TABLE "public"."case_images" (
      "id" uuid PRIMARY KEY NOT NULL,
      "case_id" uuid REFERENCES "public"."cases"("id"),
      "media_id" uuid,
      "sequence" text,
      "created_at" timestamp with time zone DEFAULT now()
    );
  END IF;
END
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_article_categories_slug ON "public"."article_categories" ("slug");
CREATE INDEX IF NOT EXISTS idx_article_subcategories_slug ON "public"."article_subcategories" ("slug");
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON "public"."articles" ("category_id");
CREATE INDEX IF NOT EXISTS idx_articles_subcategory ON "public"."articles" ("subcategory");
CREATE INDEX IF NOT EXISTS idx_cases_album_id ON "public"."cases" ("album_id");
CREATE INDEX IF NOT EXISTS idx_case_images_case_id ON "public"."case_images" ("case_id"); 