-- First, clear existing categories (if needed)
-- delete from article_categories;

-- Main Categories
insert into article_categories (name, slug, description) values
  -- Plastic Surgery Categories (High Search Volume)
  ('Facial Procedures', 'facial-procedures', 'Information about facial plastic surgery including rhinoplasty, facelifts, and facial rejuvenation'),
  ('Body Procedures', 'body-procedures', 'Body contouring, lifts, and surgical enhancement procedures'),
  ('Breast Procedures', 'breast-procedures', 'Comprehensive information about breast augmentation, reduction, and lift procedures'),
  ('Reconstructive Surgery', 'reconstructive-surgery', 'Information about reconstructive procedures and medical restoration'),

  -- Dermatology Categories (High Search Volume)
  ('Medical Dermatology', 'medical-dermatology', 'Treatment of skin conditions, diseases, and medical dermatology services'),
  ('Cosmetic Dermatology', 'cosmetic-dermatology', 'Non-surgical cosmetic treatments and skin enhancement procedures'),
  ('Acne Treatment', 'acne-treatment', 'Comprehensive acne care, treatments, and prevention strategies'),
  ('Anti-Aging', 'anti-aging', 'Anti-aging treatments, preventive care, and age management solutions'),
  ('Skin Conditions', 'skin-conditions', 'Information about various skin conditions and their treatments'),

  -- Medical Spa Treatments (Popular Services)
  ('Injectables', 'injectables', 'Information about Botox, dermal fillers, and other injectable treatments'),
  ('Laser Treatments', 'laser-treatments', 'Various laser procedures for skin rejuvenation and hair removal'),
  ('Body Contouring', 'body-contouring', 'Non-surgical body sculpting and fat reduction treatments'),
  ('Skin Rejuvenation', 'skin-rejuvenation', 'Treatments for skin renewal, texture improvement, and rejuvenation'),
  ('Hair Restoration', 'hair-restoration', 'Hair loss treatments and restoration procedures'),

  -- Functional Medicine (Growing Trends)
  ('Hormone Optimization', 'hormone-optimization', 'Hormone therapy and balance for optimal health and wellness'),
  ('Weight Management', 'weight-management', 'Medical weight loss programs and metabolic health'),
  ('Wellness Treatments', 'wellness-treatments', 'Holistic health approaches and wellness optimization'),
  ('IV Therapy', 'iv-therapy', 'Nutritional IV treatments and vitamin therapy'),
  ('Anti-Aging Medicine', 'anti-aging-medicine', 'Medical approaches to aging management and longevity'),

  -- Trending Topics (Current High Interest)
  ('Non-Surgical Procedures', 'non-surgical-procedures', 'Latest non-invasive and minimally invasive treatments'),
  ('Natural Results', 'natural-results', 'Achieving natural-looking results in aesthetic procedures'),
  ('Preventive Aesthetics', 'preventive-aesthetics', 'Preventive treatments and early intervention approaches'),
  ('Men''s Aesthetics', 'mens-aesthetics', 'Aesthetic treatments and procedures specifically for men'),
  ('Combination Treatments', 'combination-treatments', 'Synergistic treatment approaches and protocols'),

  -- Educational Content (SEO Value)
  ('Treatment Guides', 'treatment-guides', 'Comprehensive guides and information about various treatments'),
  ('Recovery & Aftercare', 'recovery-aftercare', 'Post-treatment care and recovery information'),
  ('Cost & Financing', 'cost-financing', 'Treatment costs, financing options, and payment information'),
  ('Safety & Research', 'safety-research', 'Latest research, safety information, and clinical studies'),
  ('Before & After', 'before-after', 'Treatment results, transformations, and patient journeys'),

  -- Specialty Focus (Niche High-Value)
  ('Ethnic Aesthetics', 'ethnic-aesthetics', 'Specialized treatments and considerations for different ethnic backgrounds'),
  ('Teen Aesthetics', 'teen-aesthetics', 'Age-appropriate treatments and information for younger patients'),
  ('Mommy Makeover', 'mommy-makeover', 'Post-pregnancy restoration and rejuvenation procedures'),
  ('Athletic Aesthetics', 'athletic-aesthetics', 'Treatments and procedures for active individuals and athletes'),
  ('Bridal Aesthetics', 'bridal-aesthetics', 'Pre-wedding treatments and beauty preparation');

-- Create indexes for performance
create index if not exists article_categories_name_idx on article_categories using gin(name gin_trgm_ops);
create index if not exists article_categories_description_idx on article_categories using gin(description gin_trgm_ops); 