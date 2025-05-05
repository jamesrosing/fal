-- Import article_categories
-- Source: C:\Users\JR work\Downloads\article_categories_rows.sql
-- If table doesn't exist, create it first
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'article_categories') THEN
    CREATE TABLE IF NOT EXISTS "public"."article_categories" (
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

INSERT INTO "public"."article_categories" ("id", "name", "slug", "description", "created_at", "updated_at", "order_position") 
VALUES ('0f48c8e6-4941-4212-bfe9-9807512e7fc5', 'Combination Treatments', 'combination-treatments', 'Synergistic treatment approaches and protocols', '2025-02-23 18:08:33.280356+00', '2025-02-23 18:08:33.280356+00', '0'), 
       ('118e4ac2-ba77-4a3f-8cfd-6051e0143af7', 'Anti-Aging Medicine', 'anti-aging-medicine', 'Medical approaches to aging management and longevity', '2025-02-23 18:08:33.280356+00', '2025-02-23 18:08:33.280356+00', '0'), 
       ('1506015d-2b24-493e-b33c-ba2e0a2c4396', 'Dermatology', 'dermatology', 'Dermatology treatments and skin health', '2025-03-14 02:37:06.506333+00', '2025-03-14 02:37:06.506333+00', '0'),
       ('16ab8aee-17ec-4549-b373-5d8fbeaedee8', 'Medical Spa', 'medical-spa', 'Non-surgical aesthetic treatments', '2025-03-14 02:37:06.725211+00', '2025-03-14 02:37:06.725211+00', '0'),
       ('23c49568-d166-4cd1-9357-97a0698c234c', 'Reconstructive Surgery', 'reconstructive-surgery', 'Information about reconstructive procedures and medical restoration', '2025-02-23 18:08:33.280356+00', '2025-02-23 18:08:33.280356+00', '0'),
       ('265f6d39-0039-4c68-b55a-87718604a20f', 'Functional Medicine', 'functional-medicine', 'Holistic approach to health and wellness', '2025-03-14 02:37:06.905636+00', '2025-03-14 02:37:06.905636+00', '0'),
       ('297438cf-0ee8-4249-8014-22382cf4ca85', 'Facial Procedures', 'facial-procedures', 'Information about facial plastic surgery including rhinoplasty, facelifts, and facial rejuvenation', '2025-02-23 18:08:33.280356+00', '2025-02-23 18:08:33.280356+00', '0'),
       ('29c3918b-ee34-43cd-844b-e8434cc9bd21', 'Niche Focus', 'niche-focus', 'Specialized focus areas and unique patient demographics', '2025-03-14 17:46:30.372061+00', '2025-03-14 17:46:30.372061+00', '0'),
       ('2e9c5172-e5b3-48a3-9dc5-d00697d29802', 'Ethnic Aesthetics', 'ethnic-aesthetics', 'Specialized treatments and considerations for different ethnic backgrounds', '2025-02-23 18:08:33.280356+00', '2025-02-23 18:08:33.280356+00', '0'),
       ('2ed6332d-fddb-4c96-b4c7-bf41377d612b', 'Non-Surgical Procedures', 'non-surgical-procedures', 'Latest non-invasive and minimally invasive treatments', '2025-02-23 18:08:33.280356+00', '2025-02-23 18:08:33.280356+00', '0'),
       ('72313017-e2d6-4081-9fdc-df8ca0d2b0b0', 'Plastic Surgery', 'plastic-surgery', 'Information about plastic surgery procedures', '2025-03-14 02:37:06.259754+00', '2025-03-14 02:37:06.259754+00', '0'),
       ('64e0dad2-22f0-40a1-a578-f184f31e6637', 'Latest News', 'latest-news', 'Articles about latest news', '2025-02-28 03:53:02.68891+00', '2025-02-28 03:53:02.68891+00', '0'),
       ('c8cf602d-197d-4087-a713-15934f758f2e', 'Educational', 'educational', 'Educational resources about aesthetic medicine', '2025-03-14 02:37:07.090538+00', '2025-03-14 02:37:07.090538+00', '0'),
       ('8166c96d-21b6-46bc-96f4-438722733588', 'Trending Topics', 'trending-topics', 'Latest trends and popular topics in aesthetics', '2025-03-14 17:46:29.737723+00', '2025-03-14 17:46:29.737723+00', '0')
ON CONFLICT (id) DO NOTHING;

-- Import article_subcategories
-- Source: C:\Users\JR work\Downloads\article_subcategories_rows.sql
-- If table doesn't exist, create it first
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'article_subcategories') THEN
    CREATE TABLE IF NOT EXISTS "public"."article_subcategories" (
      "id" uuid PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "slug" text NOT NULL,
      "description" text,
      "category_id" uuid,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    );
  END IF;
END
$$;

INSERT INTO "public"."article_subcategories" ("id", "name", "slug", "description", "category_id", "created_at", "updated_at")
VALUES ('04893deb-2862-4ad4-868c-d2c9b350835b', 'Body', 'body', 'Body contouring procedures', '72313017-e2d6-4081-9fdc-df8ca0d2b0b0', '2025-03-14 03:06:16.378522+00', '2025-03-14 03:06:16.378522+00'),
       ('069b2ca0-a404-4031-99d6-3ce9dc4d2717', 'Non-Surgical Procedures', 'non-surgical-procedures', 'Latest non-invasive and minimally invasive treatments', '8166c96d-21b6-46bc-96f4-438722733588', '2025-03-14 03:23:14.885096+00', '2025-03-14 03:23:14.885096+00'),
       ('07ae4817-9ed4-44bd-a95e-8048e7b43dce', 'Skin Rejuvenation', 'skin-rejuvenation', 'Treatments for skin renewal, texture improvement, and rejuvenation', '16ab8aee-17ec-4549-b373-5d8fbeaedee8', '2025-03-14 03:23:13.645428+00', '2025-03-14 03:23:13.645428+00'),
       ('159cc0ab-f5d1-455a-bdf9-4a6ee6227d3e', 'Anti-Aging Medicine', 'anti-aging-medicine', 'Medical approaches to aging management and longevity', '16ab8aee-17ec-4549-b373-5d8fbeaedee8', '2025-03-14 03:23:14.679283+00', '2025-03-14 03:23:14.679283+00'),
       ('1749ed64-d919-47f0-9c18-594ac93d63dc', 'Treatment Guides', 'treatment-guides', 'Comprehensive guides and information about various treatments', 'c8cf602d-197d-4087-a713-15934f758f2e', '2025-03-14 03:23:15.720601+00', '2025-03-14 03:23:15.720601+00'),
       ('1aa6ad92-7998-467f-b2b0-3ec02d58507c', 'Cost & Financing', 'cost-financing', 'Treatment costs, financing options, and payment information', 'c8cf602d-197d-4087-a713-15934f758f2e', '2025-03-14 03:23:16.010363+00', '2025-03-14 03:23:16.010363+00'),
       ('1f4925ab-dd66-40f3-bc67-6994f682a0f2', 'Skin Conditions', 'skin-conditions', 'Information about various skin conditions and their treatments', '1506015d-2b24-493e-b33c-ba2e0a2c4396', '2025-03-14 03:23:12.990124+00', '2025-03-14 03:23:12.990124+00'),
       ('260c2777-4205-427b-8246-ca9150df35e1', 'Cosmetic Dermatology', 'cosmetic-dermatology', 'Non-surgical cosmetic treatments and skin enhancement procedures', '1506015d-2b24-493e-b33c-ba2e0a2c4396', '2025-03-14 03:23:12.414304+00', '2025-03-14 03:23:12.414304+00'),
       ('28070c28-f8d5-4c42-8daf-589121f221bf', 'Medical Dermatology', 'medical-dermatology', 'Treatment of skin conditions, diseases, and medical dermatology services', '1506015d-2b24-493e-b33c-ba2e0a2c4396', '2025-03-14 03:23:12.228012+00', '2025-03-14 03:23:12.228012+00'),
       ('2bcd12a4-a7e7-4418-908d-6f98238d861e', 'Hair Restoration', 'hair-restoration', 'Hair loss treatments and restoration procedures', '16ab8aee-17ec-4549-b373-5d8fbeaedee8', '2025-03-14 03:23:13.828179+00', '2025-03-14 03:23:13.828179+00'),
       ('7723a12d-5cef-4682-8c69-a49c24461410', 'Breast', 'breast', 'Breast augmentation and reduction', '72313017-e2d6-4081-9fdc-df8ca0d2b0b0', '2025-03-14 03:06:16.20392+00', '2025-03-14 03:06:16.20392+00'),
       ('aaca0409-9638-4c5d-a30c-c3e99a5e22f4', 'Face', 'face', 'Facial plastic surgery procedures', '72313017-e2d6-4081-9fdc-df8ca0d2b0b0', '2025-03-14 03:06:16.052466+00', '2025-03-14 03:06:16.052466+00'),
       ('e1168ee5-a5ff-4a83-be4e-6d4dc39e0787', 'Skincare', 'skincare', 'Professional skincare treatments', '16ab8aee-17ec-4549-b373-5d8fbeaedee8', '2025-03-14 03:06:17.49327+00', '2025-03-14 03:06:17.49327+00'),
       ('2f933dc6-3a55-42ad-ae1a-9506a56d51c2', 'Injectables', 'injectables', 'Botox and fillers', '16ab8aee-17ec-4549-b373-5d8fbeaedee8', '2025-03-14 03:06:17.162252+00', '2025-03-14 03:06:17.162252+00'),
       ('485bee6e-be72-4b47-b20d-93485258cc2b', 'Wellness', 'wellness', 'Overall health and wellness', '265f6d39-0039-4c68-b55a-87718604a20f', '2025-03-14 03:06:18.062271+00', '2025-03-14 03:06:18.062271+00'),
       ('5dda171c-615c-4042-b397-c5d659ddff8c', 'Nutrition', 'nutrition', 'Nutritional therapies', '265f6d39-0039-4c68-b55a-87718604a20f', '2025-03-14 03:06:17.677485+00', '2025-03-14 03:06:17.677485+00'),
       ('ca0ed949-4c91-48e6-81dd-a2e27e6ee19c', 'Hormone Health', 'hormone', 'Hormone replacement therapy', '265f6d39-0039-4c68-b55a-87718604a20f', '2025-03-14 03:06:17.89295+00', '2025-03-14 03:06:17.89295+00')
ON CONFLICT (id) DO NOTHING;

-- Import articles
-- Source: C:\Users\JR work\Downloads\articles_rows.sql
-- If table doesn't exist, create it first
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'articles') THEN
    CREATE TABLE IF NOT EXISTS "public"."articles" (
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

INSERT INTO "public"."articles" ("id", "title", "subtitle", "slug", "content", "excerpt", "author_id", "category_id", "status", "featured_image", "featured_video", "meta_description", "meta_keywords", "published_at", "created_at", "updated_at", "reading_time", "tags", "subcategory")
VALUES ('06664550-49ec-4616-9c06-d7c5f69bbd78', 'Susan Pearose, PA-C Named Top Dermatology Physician Assistant in Newport Beach', 'Recognized for exceptional expertise and dedication to patient care in dermatology across Orange County.', 'pearose-top-physician-assistant', '[{"type":"paragraph","content":"Susan Pearose, PA-C has been recognized as one of the top dermatology physician assistants in Newport Beach, a testament to her exceptional skills and dedication to patient care."},{"type":"paragraph","content":"Our own Susan Pearose, PA-C has been recognized as one of Orange County''s leading dermatology physician assistants for her exceptional expertise and patient care."}]', 'Our own Susan Pearose, PA-C has been recognized as one of Orange County's leading dermatology physician assistants for her exceptional expertise and patient care.', null, '64e0dad2-22f0-40a1-a578-f184f31e6637', 'published', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20dermatology%20headshot%201-gjRMjadCwzrB94HEchEd1TnD04XcMY.webp', null, null, null, '2024-03-10 00:00:00+00', '2025-02-28 03:53:02.513+00', '2025-03-14 19:02:16.009261+00', null, '"{\"dermatology\",\"awards\",\"medical-care\",\"newport-beach\",\"physician-assistant\"]}', null),
       ('3aa7b477-b8cb-4b97-b478-278aa9a48079', 'Latest News in Aesthetic Medicine', null, 'latest-news-article', '[{"type":"paragraph","content":"The field of aesthetic medicine is constantly evolving with new technologies and techniques."},{"type":"paragraph","content":"In recent developments, more minimally invasive procedures are gaining popularity as patients seek effective treatments with less downtime."},{"type":"paragraph","content":"New research is also focusing on combining different modalities for synergistic effects that provide more natural-looking results."}]', 'Stay updated with the newest trends and innovations in aesthetic medicine.', null, '64e0dad2-22f0-40a1-a578-f184f31e6637', 'published', 'hero/hero-articles', null, null, null, '2023-06-15 00:00:00+00', '2023-06-15 00:00:00+00', '2025-03-14 02:37:06.296+00', '5', '"{]}', null),
       ('91bbe699-aa2c-4c48-8aac-c03b4445cd95', 'EMSculpt Neo: The Future of Body Contouring', 'Revolutionary Technology for Muscle Building and Fat Reduction', 'emsculpt-neo-future-of-body-contouring', '[{"type":"paragraph","content":"EMSculpt Neo represents the latest advancement in non-invasive body contouring technology, combining radiofrequency heating with high-intensity focused electromagnetic energy (HIFEM+) to simultaneously burn fat and build muscle."},{"type":"paragraph","content":"This revolutionary treatment can help you achieve both muscle growth and fat reduction in a single session, offering results that were previously only possible through multiple different treatments."},{"type":"heading","content":"How EMSculpt Neo Works"},{"type":"paragraph","content":"The device works by delivering synchronized RF and HIFEM+ energies, heating the muscle temperature by several degrees. This preparation allows for better muscle contractions and helps break down fat cells more effectively."}]', 'Discover how EMSculpt Neo is revolutionizing body contouring with its innovative combination of technologies for simultaneous fat reduction and muscle building.', null, null, 'published', null, null, 'Learn about EMSculpt Neo, the revolutionary body contouring treatment that combines RF and HIFEM+ technology for optimal results.', null, null, '2025-02-22 16:47:19.041899+00', '2025-03-14 19:08:27.910958+00', null, null, null),
       ('a5002947-d1ba-4f26-925a-fcbe2c07f9e4', 'New Medical Spa Services Now Available', 'Expanding our luxury medical spa offerings with advanced treatments for comprehensive body rejuvenation.', 'new-medical-spa-services', '[{"type":"paragraph","content":"Content placeholder"},{"type":"paragraph","content":"<p class=\\"article-lead\\">Allure MD is thrilled to announce the expansion of our medical spa services. Our new treatment offerings combine luxury and clinical excellence to provide you with the most advanced aesthetic solutions available."},{"type":"paragraph","content":"Content placeholder"},{"type":"paragraph","content":"Content placeholder"},{"type":"heading","content":"New Treatment Options"},{"type":"paragraph","content":"Our expanded service menu now includes:"},{"type":"list","content":"Content placeholder"},{"type":"paragraph","content":"<li>Advanced hydrafacials with customized boosters</li>"},{"type":"paragraph","content":"<li>Medical-grade chemical peels</li>"},{"type":"paragraph","content":"<li>Laser hair removal with the latest technology</li>"},{"type":"paragraph","content":"<li>Body contouring and cellulite treatments</li>"},{"type":"paragraph","content":"<li>LED light therapy</li>"},{"type":"paragraph","content":"</ul>"},{"type":"paragraph","content":"Content placeholder"},{"type":"paragraph","content":"Content placeholder"},{"type":"heading","content":"Customized Treatment Plans"},{"type":"paragraph","content":"Each treatment begins with a comprehensive consultation to create a personalized plan that addresses your specific concerns and goals. Our expert staff will guide you through:"},{"type":"list","content":"Content placeholder"},{"type":"paragraph","content":"<li>Skin analysis and assessment</li>"},{"type":"paragraph","content":"<li>Treatment recommendations</li>"},{"type":"paragraph","content":"<li>Expected outcomes and timeline</li>"},{"type":"paragraph","content":"<li>Maintenance and care instructions</li>"},{"type":"paragraph","content":"</ul>"},{"type":"paragraph","content":"Content placeholder"},{"type":"paragraph","content":"Content placeholder"},{"type":"heading","content":"The Allure MD Difference"},{"type":"paragraph","content":"What sets our medical spa services apart:"},{"type":"list","content":"Content placeholder"},{"type":"paragraph","content":"<li>Medical-grade products and equipment</li>"},{"type":"paragraph","content":"<li>Licensed and certified professionals</li>"},{"type":"paragraph","content":"<li>Comfortable, luxury environment</li>"},{"type":"paragraph","content":"<li>Comprehensive aftercare support</li>"},{"type":"paragraph","content":"</ul>"},{"type":"paragraph","content":"Content placeholder"},{"type":"paragraph","content":"Content placeholder"},{"type":"paragraph","content":"<p class=\\"article-cta\\">Visit us to experience our new medical spa services and start your journey to renewed confidence and radiance."},{"type":"paragraph","content":"Content placeholder"}]', 'Discover our expanded range of medical spa treatments designed for total body rejuvenation.', null, '64e0dad2-22f0-40a1-a578-f184f31e6637', 'published', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20medical%20esthetician%20facial%20procedure-BTAqIz6QTH8au0JcLo6JerhGR2Fyqw.webp', null, null, null, '2024-03-05 00:00:00+00', '2025-02-28 03:53:02.75+00', '2025-03-14 19:11:02.618522+00', null, '"{\"medical-spa\",\"treatments\",\"skincare\",\"wellness\"]}', null)
ON CONFLICT (id) DO NOTHING;

-- Import cases
-- Source: C:\Users\JR work\Downloads\cases_rows.sql
-- If table doesn't exist, create it first
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cases') THEN
    CREATE TABLE IF NOT EXISTS "public"."cases" (
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

INSERT INTO "public"."cases" ("id", "album_id", "title", "description", "metadata", "created_at", "slug", "updated_at")
VALUES ('2246dcfd-46a8-4af9-8232-0bedfe4817f6', 'f265549c-4a2c-46ad-aecc-950bca084bbd', '4', '', '{}', '2025-02-07 03:04:02.604085+00', '4', '2025-04-28 17:20:24.291687+00'),
       ('37fd6964-5fa6-4a4e-bf6b-91cde2ebccf1', 'f265549c-4a2c-46ad-aecc-950bca084bbd', '5', '', '{}', '2025-02-07 03:04:01.444984+00', '5', '2025-04-28 17:20:24.291687+00'),
       ('bfc023e6-eb0e-4eb6-a2ac-cf23195ef2be', 'f265549c-4a2c-46ad-aecc-950bca084bbd', '3', '', '{}', '2025-02-07 03:04:04.830213+00', '3', '2025-04-28 17:20:24.291687+00'),
       ('e12b1f10-0fcf-418a-9703-e6847a2f3966', 'd79fc2e2-1bef-4c10-8108-47f4b600a725', '1', '', '{}', '2025-02-07 03:03:58.04662+00', '1', '2025-04-28 17:20:24.291687+00'),
       ('e7cc8a58-f818-423f-a106-3762412490ac', 'f265549c-4a2c-46ad-aecc-950bca084bbd', '1', '', '{}', '2025-02-07 03:04:03.802778+00', '1', '2025-04-28 17:20:24.291687+00')
ON CONFLICT (id) DO NOTHING;

-- Import case_images
-- Source: C:\Users\JR work\Downloads\case_images_rows.sql
-- If table doesn't exist, create it first
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'case_images') THEN
    CREATE TABLE IF NOT EXISTS "public"."case_images" (
      "id" uuid PRIMARY KEY NOT NULL,
      "case_id" uuid,
      "media_id" uuid,
      "sequence" text,
      "created_at" timestamp with time zone DEFAULT now()
    );
  END IF;
END
$$;

INSERT INTO "public"."case_images" ("id", "case_id", "media_id", "sequence", "created_at")
VALUES ('080b3095-1321-41e8-b50e-70eb524ada31', 'e7cc8a58-f818-423f-a106-3762412490ac', '44acb923-bf87-43bc-a09b-47e9f6bb27c5', '14', '2025-03-09 05:42:30.73135+00'),
       ('09397341-1f47-4ee6-a4c0-a304544b82bc', '37fd6964-5fa6-4a4e-bf6b-91cde2ebccf1', '042a0992-a28c-4fc9-ba9e-afe7a3564a4d', '2', '2025-02-07 03:04:01.811447+00'),
       ('15a909e9-e3dc-4dc5-b8ac-b5d86fe7e8a0', 'e7cc8a58-f818-423f-a106-3762412490ac', 'ecb040ed-6af7-4182-ad3b-ad81164c202e', '12', '2025-03-09 05:42:30.260484+00'),
       ('15bc2bfa-c15e-48ac-b328-0b68e2f43bb0', 'e7cc8a58-f818-423f-a106-3762412490ac', '93ffcf1f-cfd8-484d-9447-bad1d41be161', '8', '2025-03-09 05:42:29.273172+00'),
       ('2150f074-126c-499f-921a-01ae0d11727f', 'e7cc8a58-f818-423f-a106-3762412490ac', '767ed4ce-50c1-4364-b8dd-d24ea4a5bc13', '11', '2025-03-09 05:42:30.014131+00'),
       ('217bc647-1ff7-4af9-a638-afc174cd15f8', 'bfc023e6-eb0e-4eb6-a2ac-cf23195ef2be', 'ec42b596-40d2-49bd-8125-df3512d79db7', '3', '2025-02-07 03:04:05.338253+00'),
       ('23d03a70-0dca-4640-b4e9-a159844799ed', '2246dcfd-46a8-4af9-8232-0bedfe4817f6', '24b7b1ea-fd3c-44de-bfe2-6418c7e6c975', '4', '2025-02-07 03:04:03.358515+00'),
       ('2efd72ea-c3f2-4531-9ca6-2749345ee380', 'e7cc8a58-f818-423f-a106-3762412490ac', '41bdb4d6-a860-42cd-a622-65c70162e4c1', '10', '2025-03-09 05:42:29.7994+00'),
       ('2f38d824-8c0a-4f5b-a0eb-14fd23436ebd', 'e7cc8a58-f818-423f-a106-3762412490ac', '581174b7-a449-4b3a-8a91-c798fe9fde1b', '4', '2025-02-07 03:04:04.581309+00'),
       ('3459026d-e475-4b45-8708-02e19be91b8b', 'e12b1f10-0fcf-418a-9703-e6847a2f3966', '143aa9d5-a786-4e7e-9de7-9103183e288c', '12', '2025-02-07 03:04:01.141364+00')
ON CONFLICT (id) DO NOTHING; 