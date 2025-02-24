-- Insert initial articles
INSERT INTO articles (
  title,
  subtitle,
  slug,
  content,
  excerpt,
  status,
  meta_description,
  created_at,
  updated_at
) VALUES
(
  'EMSculpt Neo: The Future of Body Contouring',
  'Revolutionary Technology for Muscle Building and Fat Reduction',
  'emsculpt-neo-future-of-body-contouring',
  '[
    {
      "type": "paragraph",
      "content": "EMSculpt Neo represents the latest advancement in non-invasive body contouring technology, combining radiofrequency heating with high-intensity focused electromagnetic energy (HIFEM+) to simultaneously burn fat and build muscle."
    },
    {
      "type": "paragraph",
      "content": "This revolutionary treatment can help you achieve both muscle growth and fat reduction in a single session, offering results that were previously only possible through multiple different treatments."
    },
    {
      "type": "heading",
      "content": "How EMSculpt Neo Works"
    },
    {
      "type": "paragraph",
      "content": "The device works by delivering synchronized RF and HIFEM+ energies, heating the muscle temperature by several degrees. This preparation allows for better muscle contractions and helps break down fat cells more effectively."
    }
  ]'::jsonb,
  'Discover how EMSculpt Neo is revolutionizing body contouring with its innovative combination of technologies for simultaneous fat reduction and muscle building.',
  'published',
  'Learn about EMSculpt Neo, the revolutionary body contouring treatment that combines RF and HIFEM+ technology for optimal results.',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  'Understanding Medical Grade Skincare',
  'Why Professional Products Make a Difference',
  'understanding-medical-grade-skincare',
  '[
    {
      "type": "paragraph",
      "content": "Medical grade skincare products are formulated with higher concentrations of active ingredients and are backed by clinical research to ensure both safety and efficacy."
    },
    {
      "type": "paragraph",
      "content": "Unlike over-the-counter products, medical grade skincare is designed to penetrate deeper into the skin, delivering active ingredients where they can make the most impact."
    },
    {
      "type": "heading",
      "content": "Benefits of Medical Grade Products"
    },
    {
      "type": "list",
      "content": "Higher concentration of active ingredients\nBetter penetration into the skin\nClinically proven results\nProfessional guidance and customization",
      "metadata": { "ordered": false }
    }
  ]'::jsonb,
  'Explore the science behind medical grade skincare and learn why these professional products deliver superior results compared to over-the-counter alternatives.',
  'published',
  'Discover the benefits of medical grade skincare products and why they outperform over-the-counter alternatives.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
(
  'The Complete Guide to Dermal Fillers',
  'Everything You Need to Know About Injectable Treatments',
  'complete-guide-dermal-fillers',
  '[
    {
      "type": "paragraph",
      "content": "Dermal fillers are injectable treatments that help restore volume, smooth wrinkles, and enhance facial contours. Modern fillers are primarily made from hyaluronic acid, a naturally occurring substance in your skin."
    },
    {
      "type": "heading",
      "content": "Types of Dermal Fillers"
    },
    {
      "type": "list",
      "content": "Hyaluronic Acid Fillers\nCalcium Hydroxylapatite Fillers\nPoly-L-lactic Acid Fillers\nPolymethylmethacrylate (PMMA) Fillers",
      "metadata": { "ordered": false }
    },
    {
      "type": "paragraph",
      "content": "Each type of filler has specific properties that make it ideal for certain areas and concerns. Your provider will help determine the best option for your goals."
    }
  ]'::jsonb,
  'Learn about different types of dermal fillers, how they work, and what to expect from treatment in our comprehensive guide.',
  'published',
  'Comprehensive guide to dermal fillers: types, benefits, and what to expect from injectable treatments.',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
); 