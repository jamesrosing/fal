import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

/**
 * API route for fetching the site structure for the Media Explorer
 * This builds a hierarchical tree of pages and their sections
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to Supabase to get any existing section_media entries
    const supabase = createClient();
    
    // Get all section_media entries to identify active sections
    const { data: sectionMediaItems, error } = await supabase
      .from('section_media')
      .select('page_path, section_name')
      .order('page_path');
    
    if (error) {
      console.error('Error fetching section_media items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch section media items' },
        { status: 500 }
      );
    }
    
    // Extract unique page paths and section names
    const knownPages = new Set<string>();
    const pageSections = new Map<string, Set<string>>();
    
    sectionMediaItems?.forEach(item => {
      knownPages.add(item.page_path);
      
      if (!pageSections.has(item.page_path)) {
        pageSections.set(item.page_path, new Set<string>());
      }
      
      pageSections.get(item.page_path)?.add(item.section_name);
    });
    
    // Define standard sections that should be available on all pages
    const standardSections = ['hero', 'main', 'gallery', 'content', 'banner'];
    
    // Define the site structure - this would ideally be derived from your routing
    // or actual page files, but we'll define a basic structure here
    const siteStructure = buildSiteStructure();
    
    // Add known pages and sections from the database
    knownPages.forEach(pagePath => {
      // Add the page to the structure if it doesn't exist
      const sections = Array.from(pageSections.get(pagePath) || []);
      addPageToStructure(siteStructure, pagePath, sections);
    });
    
    return NextResponse.json({ structure: siteStructure });
  } catch (error) {
    console.error('Error building site structure:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Builds the basic site structure based on typical page organization
 */
function buildSiteStructure() {
  // Define the main site areas
  const structure: Record<string, any> = {
    home: {
      name: 'Home',
      path: '',
      sections: ['hero', 'about', 'services', 'team', 'testimonials', 'contact'],
      children: {}
    },
    services: {
      name: 'Services',
      path: 'services',
      sections: ['hero', 'main'],
      children: {
        'dermatology': {
          name: 'Dermatology',
          path: 'services/dermatology',
          sections: ['hero', 'main', 'treatments', 'doctors'],
          children: {
            'acne': { 
              name: 'Acne', 
              path: 'services/dermatology/acne',
              sections: ['hero', 'main', 'treatments', 'before-after'],
              children: {}
            },
            'eczema': { 
              name: 'Eczema', 
              path: 'services/dermatology/eczema',
              sections: ['hero', 'main', 'treatments', 'before-after'],
              children: {}
            },
            'psoriasis': { 
              name: 'Psoriasis', 
              path: 'services/dermatology/psoriasis',
              sections: ['hero', 'main', 'treatments', 'before-after'],
              children: {}
            },
            'rosacea': { 
              name: 'Rosacea', 
              path: 'services/dermatology/rosacea',
              sections: ['hero', 'main', 'treatments', 'before-after'],
              children: {}
            },
            'skin-screening': { 
              name: 'Skin Screening', 
              path: 'services/dermatology/skin-screening',
              sections: ['hero', 'main', 'process', 'importance'],
              children: {}
            }
          }
        },
        'medical-spa': {
          name: 'Medical Spa',
          path: 'services/medical-spa',
          sections: ['hero', 'main', 'treatments', 'specialists'],
          children: {
            'cosmetic-injections': { 
              name: 'Cosmetic Injections', 
              path: 'services/medical-spa/cosmetic-injections',
              sections: ['hero', 'main', 'treatments', 'before-after'],
              children: {}
            },
            'emsculpt': { 
              name: 'Emsculpt', 
              path: 'services/medical-spa/emsculpt',
              sections: ['hero', 'main', 'process', 'results', 'before-after'],
              children: {}
            },
            'esthetician-services': { 
              name: 'Esthetician Services', 
              path: 'services/medical-spa/esthetician-services',
              sections: ['hero', 'main', 'services-list', 'specialists'],
              children: {}
            },
            'injectables': { 
              name: 'Injectables', 
              path: 'services/medical-spa/injectables',
              sections: ['hero', 'main', 'types', 'before-after'],
              children: {}
            },
            'rf-microneedling': { 
              name: 'RF Microneedling', 
              path: 'services/medical-spa/rf-microneedling',
              sections: ['hero', 'main', 'process', 'results', 'before-after'],
              children: {}
            },
            'shapescale': { 
              name: 'Shapescale', 
              path: 'services/medical-spa/shapescale',
              sections: ['hero', 'main', 'process', 'technology'],
              children: {}
            },
            'skin-lasers': { 
              name: 'Skin Lasers', 
              path: 'services/medical-spa/skin-lasers',
              sections: ['hero', 'main', 'technologies', 'treatments', 'before-after'],
              children: {}
            }
          }
        },
        'plastic-surgery': {
          name: 'Plastic Surgery',
          path: 'services/plastic-surgery',
          sections: ['hero', 'main', 'procedures', 'surgeons'],
          children: {
            'body': { 
              name: 'Body', 
              path: 'services/plastic-surgery/body',
              sections: ['hero', 'main', 'procedures', 'before-after'],
              children: {}
            },
            'breast': { 
              name: 'Breast', 
              path: 'services/plastic-surgery/breast',
              sections: ['hero', 'main', 'procedures', 'before-after'],
              children: {}
            },
            'head-and-neck': { 
              name: 'Head and Neck', 
              path: 'services/plastic-surgery/head-and-neck',
              sections: ['hero', 'main', 'procedures', 'before-after'],
              children: {}
            }
          }
        },
        'functional-medicine': {
          name: 'Functional Medicine',
          path: 'services/functional-medicine',
          sections: ['hero', 'main', 'approach', 'specialists'],
          children: {
            'cardiometabolic-optimization': { 
              name: 'Cardiometabolic Optimization', 
              path: 'services/functional-medicine/cardiometabolic-optimization',
              sections: ['hero', 'main', 'approach', 'benefits'],
              children: {}
            },
            'epigenetic-optimization': { 
              name: 'Epigenetic Optimization', 
              path: 'services/functional-medicine/epigenetic-optimization',
              sections: ['hero', 'main', 'approach', 'benefits'],
              children: {}
            },
            'hair-restoration': { 
              name: 'Hair Restoration', 
              path: 'services/functional-medicine/hair-restoration',
              sections: ['hero', 'main', 'treatments', 'before-after'],
              children: {}
            },
            'hormone-optimization': { 
              name: 'Hormone Optimization', 
              path: 'services/functional-medicine/hormone-optimization',
              sections: ['hero', 'main', 'approach', 'benefits'],
              children: {}
            },
            'neurocognitive-performance': { 
              name: 'Neurocognitive Performance', 
              path: 'services/functional-medicine/neurocognitive-performance',
              sections: ['hero', 'main', 'approach', 'benefits'],
              children: {}
            },
            'sleep-travel-optimization': { 
              name: 'Sleep & Travel Optimization', 
              path: 'services/functional-medicine/sleep-travel-optimization',
              sections: ['hero', 'main', 'approach', 'benefits'],
              children: {}
            }
          }
        }
      }
    },
    about: {
      name: 'About',
      path: 'about',
      sections: ['hero', 'mission', 'values', 'history', 'team'],
      children: {}
    },
    team: {
      name: 'Team',
      path: 'team',
      sections: ['hero', 'doctors', 'specialists', 'staff'],
      children: {}
    },
    articles: {
      name: 'Articles',
      path: 'articles',
      sections: ['hero', 'featured', 'categories', 'recent'],
      children: {}
    },
    gallery: {
      name: 'Gallery',
      path: 'gallery',
      sections: ['hero', 'collections', 'featured'],
      children: {}
    },
    contact: {
      name: 'Contact',
      path: 'contact',
      sections: ['hero', 'form', 'locations', 'map'],
      children: {}
    },
    financing: {
      name: 'Financing',
      path: 'financing',
      sections: ['hero', 'options', 'application'],
      children: {}
    },
    reviews: {
      name: 'Reviews',
      path: 'reviews',
      sections: ['hero', 'testimonials', 'ratings'],
      children: {}
    },
    appointment: {
      name: 'Appointment',
      path: 'appointment',
      sections: ['hero', 'form', 'calendar'],
      children: {}
    }
  };
  
  return structure;
}

/**
 * Adds a page to the site structure if it doesn't exist
 */
function addPageToStructure(structure: Record<string, any>, pagePath: string, sections: string[]) {
  // Split the path into parts
  const parts = pagePath.split('/').filter(Boolean);
  
  if (parts.length === 0) {
    // This is the home page
    if (!structure.home) {
      structure.home = {
        name: 'Home',
        path: '',
        sections: sections.length > 0 ? sections : ['hero', 'main'],
        children: {}
      };
    } else if (sections.length > 0) {
      // Add new sections
      structure.home.sections = Array.from(new Set([...structure.home.sections, ...sections]));
    }
    return;
  }
  
  // Navigate through the structure to find or create the page
  let current = structure;
  let currentPath = '';
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    
    if (!current[part]) {
      // Create the page
      current[part] = {
        name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
        path: currentPath,
        sections: [],
        children: {}
      };
    }
    
    if (i === parts.length - 1) {
      // This is the leaf node, add the sections
      current[part].sections = Array.from(
        new Set([...current[part].sections, ...sections])
      );
    }
    
    current = current[part].children;
  }
} 