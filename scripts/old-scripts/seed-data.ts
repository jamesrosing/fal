import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { Database } from '../../lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function seedData() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set');
    process.exit(1);
  }

  console.log('Connecting to Supabase...');
  
  // Create a Supabase client with admin privileges
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  
  try {
    // Check if seed data already exists
    console.log('Checking if seed data already exists...');
    const { data: existingTeamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('id')
      .limit(1);
    
    if (teamMembersError) {
      console.error('Error checking for existing data:', teamMembersError);
      return;
    }
    
    if (existingTeamMembers && existingTeamMembers.length > 0) {
      console.log('Database already contains seed data. Use --force to override.');
      
      // Check if force flag is provided
      if (!process.argv.includes('--force')) {
        console.log('Seed operation aborted. Use --force to override existing data.');
        return;
      }
      
      console.log('--force flag detected. Proceeding with seeding operation...');
    }
    
    // Begin transaction
    console.log('Beginning database seed...');
    
    // Seed team_members
    console.log('Seeding team_members table...');
    const teamMembers = [
      {
        name: 'Dr. Jane Smith',
        title: 'Medical Director',
        role: 'director',
        image_url: 'https://example.com/images/jane-smith.jpg',
        description: 'Board-certified with over 15 years of experience.',
        order: 1,
        is_provider: true
      },
      {
        name: 'Dr. Michael Johnson',
        title: 'Lead Physician',
        role: 'physician',
        image_url: 'https://example.com/images/michael-johnson.jpg',
        description: 'Specializes in advanced dermatological procedures.',
        order: 2,
        is_provider: true
      },
      {
        name: 'Sarah Williams',
        title: 'Patient Coordinator',
        role: 'staff',
        image_url: 'https://example.com/images/sarah-williams.jpg',
        description: 'Ensuring smooth patient experience for over 5 years.',
        order: 3,
        is_provider: false
      }
    ];
    
    const { data: insertedTeamMembers, error: insertTeamError } = await supabase
      .from('team_members')
      .insert(teamMembers)
      .select();
      
    if (insertTeamError) {
      console.error('Error seeding team_members:', insertTeamError);
      return;
    }
    
    console.log(`Inserted ${insertedTeamMembers?.length || 0} team members`);
    
    // Seed gallery
    console.log('Seeding galleries table...');
    const galleries = [
      {
        title: 'Before & After Gallery',
        description: 'See real results from our procedures.'
      },
      {
        title: 'Facility Tour',
        description: 'Take a virtual tour of our state-of-the-art facility.'
      }
    ];
    
    const { data: insertedGalleries, error: galleryError } = await supabase
      .from('galleries')
      .insert(galleries)
      .select();
      
    if (galleryError) {
      console.error('Error seeding galleries:', galleryError);
      return;
    }
    
    console.log(`Inserted ${insertedGalleries?.length || 0} galleries`);
    
    // Seed albums
    if (insertedGalleries && insertedGalleries.length > 0) {
      console.log('Seeding albums table...');
      const albums = [
        {
          gallery_id: insertedGalleries[0].id,
          title: 'Skin Treatments',
          description: 'Before and after results for various skin treatments.',
          order: 1
        },
        {
          gallery_id: insertedGalleries[0].id,
          title: 'Body Contouring',
          description: 'See the transformation with our body contouring procedures.',
          order: 2
        },
        {
          gallery_id: insertedGalleries[1].id,
          title: 'Reception Area',
          description: 'Our welcoming reception area.',
          order: 1
        }
      ];
      
      const { data: insertedAlbums, error: albumError } = await supabase
        .from('albums')
        .insert(albums)
        .select();
        
      if (albumError) {
        console.error('Error seeding albums:', albumError);
        return;
      }
      
      console.log(`Inserted ${insertedAlbums?.length || 0} albums`);
      
      // Seed cases
      if (insertedAlbums && insertedAlbums.length > 0) {
        console.log('Seeding cases table...');
        const cases = [
          {
            album_id: insertedAlbums[0].id,
            title: 'Acne Treatment',
            description: 'Acne treatment results after 3 months.',
            metadata: { treatment_duration: '3 months', sessions: 6 }
          },
          {
            album_id: insertedAlbums[1].id,
            title: 'CoolSculpting Results',
            description: 'Results after 2 CoolSculpting sessions.',
            metadata: { treatment_duration: '8 weeks', sessions: 2 }
          }
        ];
        
        const { data: insertedCases, error: caseError } = await supabase
          .from('cases')
          .insert(cases)
          .select();
          
        if (caseError) {
          console.error('Error seeding cases:', caseError);
          return;
        }
        
        console.log(`Inserted ${insertedCases?.length || 0} cases`);
        
        // Seed images (would normally require actual Cloudinary URLs)
        if (insertedCases && insertedCases.length > 0) {
          console.log('Seeding images table...');
          const images = [
            {
              case_id: insertedCases[0].id,
              cloudinary_url: 'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
              caption: 'Before treatment',
              tags: ['before', 'acne'],
              display_order: 1
            },
            {
              case_id: insertedCases[0].id,
              cloudinary_url: 'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
              caption: 'After treatment',
              tags: ['after', 'acne', 'results'],
              display_order: 2
            },
            {
              case_id: insertedCases[1].id,
              cloudinary_url: 'https://res.cloudinary.com/demo/image/upload/sample3.jpg',
              caption: 'Before CoolSculpting',
              tags: ['before', 'coolsculpting'],
              display_order: 1
            },
            {
              case_id: insertedCases[1].id,
              cloudinary_url: 'https://res.cloudinary.com/demo/image/upload/sample4.jpg',
              caption: 'After CoolSculpting',
              tags: ['after', 'coolsculpting', 'results'],
              display_order: 2
            }
          ];
          
          const { data: insertedImages, error: imageError } = await supabase
            .from('images')
            .insert(images)
            .select();
            
          if (imageError) {
            console.error('Error seeding images:', imageError);
            return;
          }
          
          console.log(`Inserted ${insertedImages?.length || 0} images`);
        }
      }
    }
    
    // Seed article categories
    console.log('Seeding article_categories table...');
    const articleCategories = [
      {
        name: 'Skin Care',
        slug: 'skin-care',
        description: 'Articles about skin care routines and tips.',
        order_position: 1
      },
      {
        name: 'Treatments',
        slug: 'treatments',
        description: 'Learn about our treatment options.',
        order_position: 2
      },
      {
        name: 'News',
        slug: 'news',
        description: 'Latest news and updates from our clinic.',
        order_position: 3
      }
    ];
    
    const { data: insertedCategories, error: categoryError } = await supabase
      .from('article_categories')
      .insert(articleCategories)
      .select();
      
    if (categoryError) {
      console.error('Error seeding article_categories:', categoryError);
      return;
    }
    
    console.log(`Inserted ${insertedCategories?.length || 0} article categories`);
    
    // Seed articles
    if (insertedCategories && insertedCategories.length > 0 && insertedTeamMembers && insertedTeamMembers.length > 0) {
      console.log('Seeding articles table...');
      const articles = [
        {
          title: 'The Ultimate Guide to Daily Skin Care',
          subtitle: 'Simple steps for radiant skin',
          slug: 'ultimate-guide-daily-skin-care',
          content: JSON.stringify([
            { type: 'paragraph', content: 'Maintaining healthy skin is easier than you think.' },
            { type: 'paragraph', content: 'In this guide, we walk through a simple daily routine.' }
          ]),
          excerpt: 'Learn the essential steps for a daily skin care routine that works.',
          author_id: insertedTeamMembers[0].id,
          category_id: insertedCategories[0].id,
          status: 'published',
          meta_description: 'Comprehensive guide to daily skin care routines from experts.',
          meta_keywords: ['skin care', 'routine', 'guide'],
          published_at: new Date().toISOString(),
          reading_time: 5,
          tags: ['skin care', 'daily routine', 'beginner']
        },
        {
          title: 'Understanding CoolSculpting',
          subtitle: 'What to expect from this popular treatment',
          slug: 'understanding-coolsculpting',
          content: JSON.stringify([
            { type: 'paragraph', content: 'CoolSculpting is a non-invasive fat reduction treatment.' },
            { type: 'paragraph', content: 'It works by freezing fat cells, which are then naturally eliminated by the body.' }
          ]),
          excerpt: 'Learn how CoolSculpting works and what results you can expect.',
          author_id: insertedTeamMembers[1].id,
          category_id: insertedCategories[1].id,
          status: 'published',
          meta_description: 'Comprehensive guide to CoolSculpting treatment and results.',
          meta_keywords: ['coolsculpting', 'fat reduction', 'body contouring'],
          published_at: new Date().toISOString(),
          reading_time: 8,
          tags: ['coolsculpting', 'treatments', 'body contouring']
        }
      ];
      
      const { data: insertedArticles, error: articleError } = await supabase
        .from('articles')
        .insert(articles)
        .select();
        
      if (articleError) {
        console.error('Error seeding articles:', articleError);
        return;
      }
      
      console.log(`Inserted ${insertedArticles?.length || 0} articles`);
    }
    
    // Seed media_assets
    console.log('Seeding media_assets table...');
    const mediaAssets = [
      {
        cloudinary_id: 'site/hero-banner',
        type: 'image',
        title: 'Homepage Hero Banner',
        alt_text: 'Welcome to our aesthetic clinic',
        width: 1920,
        height: 1080,
        format: 'jpg'
      },
      {
        cloudinary_id: 'site/about-clinic',
        type: 'image',
        title: 'Clinic Exterior',
        alt_text: 'Our modern clinic building',
        width: 800,
        height: 600,
        format: 'jpg'
      },
      {
        cloudinary_id: 'site/welcome-video',
        type: 'video',
        title: 'Welcome Video',
        alt_text: 'Welcome message from our team',
        width: 1280,
        height: 720,
        format: 'mp4'
      }
    ];
    
    const { data: insertedMediaAssets, error: mediaError } = await supabase
      .from('media_assets')
      .insert(mediaAssets)
      .select();
      
    if (mediaError) {
      console.error('Error seeding media_assets:', mediaError);
      return;
    }
    
    console.log(`Inserted ${insertedMediaAssets?.length || 0} media assets`);
    
    // Seed application_structure and media_mappings
    if (insertedMediaAssets && insertedMediaAssets.length > 0) {
      console.log('Seeding application_structure and media_mappings tables...');
      
      // Seed application structure
      const appStructure = [
        {
          placeholder_id: 'home_hero_banner',
          type: 'image',
          page: 'home',
          section: 'hero'
        },
        {
          placeholder_id: 'about_clinic_exterior',
          type: 'image',
          page: 'about',
          section: 'main'
        },
        {
          placeholder_id: 'home_welcome_video',
          type: 'video',
          page: 'home',
          section: 'welcome'
        }
      ];
      
      const { data: insertedStructure, error: structureError } = await supabase
        .from('application_structure')
        .insert(appStructure)
        .select();
        
      if (structureError) {
        console.error('Error seeding application_structure:', structureError);
        return;
      }
      
      console.log(`Inserted ${insertedStructure?.length || 0} application structure entries`);
      
      // Seed media mappings
      if (insertedStructure && insertedStructure.length > 0) {
        const mediaMappings = [
          {
            placeholder_id: 'home_hero_banner',
            media_id: insertedMediaAssets[0].id
          },
          {
            placeholder_id: 'about_clinic_exterior',
            media_id: insertedMediaAssets[1].id
          },
          {
            placeholder_id: 'home_welcome_video',
            media_id: insertedMediaAssets[2].id
          }
        ];
        
        const { data: insertedMappings, error: mappingError } = await supabase
          .from('media_mappings')
          .insert(mediaMappings)
          .select();
          
        if (mappingError) {
          console.error('Error seeding media_mappings:', mappingError);
          return;
        }
        
        console.log(`Inserted ${insertedMappings?.length || 0} media mappings`);
      }
    }
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

// Run seeding process
seedData().catch(console.error); 