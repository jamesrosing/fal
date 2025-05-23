-- Insert team members data
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') THEN
    -- Only perform inserts if the team_members table exists
    INSERT INTO "public"."team_members" ("id", "name", "title", "role", "image_url", "description", "order", "is_provider", "created_at", "updated_at") 
    VALUES 
    ('885a1b9d-234f-4d3a-9e4a-78ff46e7f9ca', 'Rachelle', null, 'Practice Manager', '', 'Rachelle is our dedicated practice manager, ensuring smooth operations and exceptional patient care.', '5', 'false', '2025-02-10 23:30:03.746941+00', '2025-02-10 23:30:03.746941+00'), 
    ('8fbfa6fe-3d25-47c3-862b-f20278fa8971', 'Julia', null, 'Medical Esthetician', '', 'Julia is our experienced medical esthetician, providing advanced skincare treatments and personalized beauty solutions.', '4', 'true', '2025-02-10 23:30:03.746941+00', '2025-02-10 23:30:03.746941+00'), 
    ('9c9823c0-d44a-4491-975e-c9dc3a08be1c', 'Dr. Pooja Gidwani', 'MD', 'Functional Medicine Specialist', '', 'Dr. Pooja Gidwani specializes in functional medicine, focusing on holistic wellness and preventive care.', '3', 'true', '2025-02-10 23:30:03.746941+00', '2025-02-10 23:30:03.746941+00'), 
    ('e2c46736-b180-4fae-ad97-bda9d41d1b9b', 'Dr. James Rosing', 'MD, FACS', 'Board Certified Plastic Surgeon', '', 'Dr. James Rosing is a highly skilled board-certified plastic surgeon specializing in aesthetic and reconstructive procedures.', '1', 'true', '2025-02-10 23:30:03.746941+00', '2025-02-10 23:30:03.746941+00'), 
    ('edf24b77-b888-4134-9289-fbeedce1fec9', 'Susan Pearose', 'PA-C', 'Board Certified Dermatology Physician Assistant', '', 'Dr. Susan Pearose is a board-certified dermatology physician assistant with expertise in medical and cosmetic dermatology.', '2', 'true', '2025-02-10 23:30:03.746941+00', '2025-02-10 23:50:22.563999+00')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END
$$;