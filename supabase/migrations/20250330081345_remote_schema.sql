

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."admin_metadata"("user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  admin_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'is_admin', EXISTS (
      SELECT 1 FROM admin_users au 
      JOIN auth.users u ON u.id = au.user_id
      WHERE u.email = auth.email() OR u.phone = auth.jwt() ->> 'phone'
    )
  ) INTO admin_data;
  
  RETURN admin_data;
END;
$$;


ALTER FUNCTION "public"."admin_metadata"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_foreign_keys"("table_name" "text") RETURNS TABLE("column_name" "text", "referenced_table" "text", "referenced_column" "text")
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        kcu.column_name::TEXT,
        ccu.table_name::TEXT AS referenced_table,
        ccu.column_name::TEXT AS referenced_column
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = table_name;
    END;
    $$;


ALTER FUNCTION "public"."get_foreign_keys"("table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.users (id, role, is_admin)
  VALUES (new.id, 'user', false);
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."make_user_admin"("user_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Check if the user exists and get their ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Insert or update the user as admin
  INSERT INTO public.users (id, role, is_admin)
  VALUES (target_user_id, 'admin', true)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', is_admin = true;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."make_user_admin"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."run_sql"("sql" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  EXECUTE sql;
END;
$$;


ALTER FUNCTION "public"."run_sql"("sql" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_images_display_order"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."set_images_display_order"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_image_orders"("image_orders" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_image_orders"("image_orders" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gallery_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."albums" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" integer NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "category" "text" NOT NULL,
    "snippet" "text",
    "image" "text",
    "audio_src" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "is_draft" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "authors" "jsonb",
    "external_id" "text"
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."articles"."external_id" IS 'Unique identifier for external sources (e.g., PubMed ID)';



CREATE SEQUENCE IF NOT EXISTS "public"."articles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."articles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."articles_id_seq" OWNED BY "public"."articles"."id";



CREATE TABLE IF NOT EXISTS "public"."audio_files" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "duration" integer,
    "transcript" "text",
    "article_id" integer,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."audio_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "album_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."galleries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."galleries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "category" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gallery_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "cloudinary_url" "text" NOT NULL,
    "caption" "text",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "display_order" integer NOT NULL
);


ALTER TABLE "public"."images" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."images_display_order_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."images_display_order_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."images_display_order_seq" OWNED BY "public"."images"."display_order";



CREATE TABLE IF NOT EXISTS "public"."media_assets" (
    "placeholder_id" "text" NOT NULL,
    "cloudinary_id" "text" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."media_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_placeholders" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "area" "text" NOT NULL,
    "path" "text" NOT NULL,
    "dimensions" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."media_placeholders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schema_migrations" (
    "version" integer NOT NULL,
    "applied_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."schema_migrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_admin" boolean DEFAULT false,
    CONSTRAINT "valid_role" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."articles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."articles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."images" ALTER COLUMN "display_order" SET DEFAULT "nextval"('"public"."images_display_order_seq"'::"regclass");



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_external_id_key" UNIQUE ("external_id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audio_files"
    ADD CONSTRAINT "audio_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."galleries"
    ADD CONSTRAINT "galleries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_items"
    ADD CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."images"
    ADD CONSTRAINT "images_case_url_key" UNIQUE ("case_id", "cloudinary_url");



ALTER TABLE ONLY "public"."images"
    ADD CONSTRAINT "images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("placeholder_id");



ALTER TABLE ONLY "public"."media_placeholders"
    ADD CONSTRAINT "media_placeholders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "articles_category_idx" ON "public"."articles" USING "btree" ("category");



CREATE INDEX "articles_created_at_idx" ON "public"."articles" USING "btree" ("created_at");



CREATE INDEX "idx_albums_gallery_id" ON "public"."albums" USING "btree" ("gallery_id");



CREATE INDEX "idx_albums_title_lower" ON "public"."albums" USING "btree" ("lower"("title"));



CREATE INDEX "idx_audio_files_article_id" ON "public"."audio_files" USING "btree" ("article_id");



CREATE INDEX "idx_audio_files_created_at" ON "public"."audio_files" USING "btree" ("created_at");



CREATE INDEX "idx_cases_album_id" ON "public"."cases" USING "btree" ("album_id");



CREATE INDEX "idx_gallery_items_category" ON "public"."gallery_items" USING "btree" ("category");



CREATE INDEX "idx_gallery_items_created_at" ON "public"."gallery_items" USING "btree" ("created_at");



CREATE INDEX "idx_images_case_id" ON "public"."images" USING "btree" ("case_id");



CREATE INDEX "idx_images_tags" ON "public"."images" USING "gin" ("tags");



CREATE INDEX "idx_media_assets_cloudinary_id" ON "public"."media_assets" USING "btree" ("cloudinary_id");



CREATE INDEX "idx_media_placeholders_area" ON "public"."media_placeholders" USING "btree" ("area");



CREATE INDEX "idx_media_placeholders_path" ON "public"."media_placeholders" USING "btree" ("path");



CREATE INDEX "users_role_idx" ON "public"."users" USING "btree" ("role");



CREATE OR REPLACE TRIGGER "articles_updated_at" BEFORE UPDATE ON "public"."articles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "audio_files_updated_at" BEFORE UPDATE ON "public"."audio_files" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "gallery_items_updated_at" BEFORE UPDATE ON "public"."gallery_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "images_set_display_order" BEFORE INSERT ON "public"."images" FOR EACH ROW EXECUTE FUNCTION "public"."set_images_display_order"();



CREATE OR REPLACE TRIGGER "update_articles_modtime" BEFORE UPDATE ON "public"."articles" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_media_placeholders_updated_at" BEFORE UPDATE ON "public"."media_placeholders" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_users_modtime" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audio_files"
    ADD CONSTRAINT "audio_files_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."images"
    ADD CONSTRAINT "images_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admins can delete users" ON "public"."users" FOR DELETE USING (("auth"."uid"() IN ( SELECT "users_1"."id"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."role" = 'admin'::"text"))));



CREATE POLICY "Admins can insert new users" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "users_1"."id"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."role" = 'admin'::"text"))));



CREATE POLICY "Admins can update all user data" ON "public"."users" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "users_1"."id"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."role" = 'admin'::"text"))));



CREATE POLICY "Admins can view all user data" ON "public"."users" FOR SELECT USING (("auth"."uid"() IN ( SELECT "users_1"."id"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."role" = 'admin'::"text"))));



CREATE POLICY "Admins have full access to articles" ON "public"."articles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins have full access to audio_files" ON "public"."audio_files" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins have full access to gallery" ON "public"."gallery_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text")))));



CREATE POLICY "Anyone can read published articles" ON "public"."articles" FOR SELECT USING ((NOT "is_draft"));



CREATE POLICY "Users can insert own profile" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "id") OR (( SELECT "users_1"."role"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"())) = 'admin'::"text"))) WITH CHECK ((("auth"."uid"() = "id") OR (( SELECT "users_1"."role"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"())) = 'admin'::"text")));



CREATE POLICY "Users can update own user data" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK ((("auth"."uid"() = "id") AND ("role" = 'user'::"text")));



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR (( SELECT "users_1"."role"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"())) = 'admin'::"text")));



CREATE POLICY "Users can view own user data" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view public gallery items" ON "public"."gallery_items" FOR SELECT USING (true);



CREATE POLICY "Users can view published audio files" ON "public"."audio_files" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."articles" "a"
  WHERE (("a"."id" = "audio_files"."article_id") AND (NOT "a"."is_draft")))));



ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audio_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gallery_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."admin_metadata"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_metadata"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_metadata"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_foreign_keys"("table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_foreign_keys"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_foreign_keys"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."make_user_admin"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."make_user_admin"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."make_user_admin"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."run_sql"("sql" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."run_sql"("sql" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."run_sql"("sql" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_images_display_order"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_images_display_order"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_images_display_order"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_image_orders"("image_orders" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_image_orders"("image_orders" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_image_orders"("image_orders" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."albums" TO "anon";
GRANT ALL ON TABLE "public"."albums" TO "authenticated";
GRANT ALL ON TABLE "public"."albums" TO "service_role";



GRANT ALL ON TABLE "public"."articles" TO "anon";
GRANT ALL ON TABLE "public"."articles" TO "authenticated";
GRANT ALL ON TABLE "public"."articles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."articles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."articles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."articles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."audio_files" TO "anon";
GRANT ALL ON TABLE "public"."audio_files" TO "authenticated";
GRANT ALL ON TABLE "public"."audio_files" TO "service_role";



GRANT ALL ON TABLE "public"."cases" TO "anon";
GRANT ALL ON TABLE "public"."cases" TO "authenticated";
GRANT ALL ON TABLE "public"."cases" TO "service_role";



GRANT ALL ON TABLE "public"."galleries" TO "anon";
GRANT ALL ON TABLE "public"."galleries" TO "authenticated";
GRANT ALL ON TABLE "public"."galleries" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_items" TO "anon";
GRANT ALL ON TABLE "public"."gallery_items" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_items" TO "service_role";



GRANT ALL ON TABLE "public"."images" TO "anon";
GRANT ALL ON TABLE "public"."images" TO "authenticated";
GRANT ALL ON TABLE "public"."images" TO "service_role";



GRANT ALL ON SEQUENCE "public"."images_display_order_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."images_display_order_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."images_display_order_seq" TO "service_role";



GRANT ALL ON TABLE "public"."media_assets" TO "anon";
GRANT ALL ON TABLE "public"."media_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."media_assets" TO "service_role";



GRANT ALL ON TABLE "public"."media_placeholders" TO "anon";
GRANT ALL ON TABLE "public"."media_placeholders" TO "authenticated";
GRANT ALL ON TABLE "public"."media_placeholders" TO "service_role";



GRANT ALL ON TABLE "public"."schema_migrations" TO "anon";
GRANT ALL ON TABLE "public"."schema_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."schema_migrations" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
