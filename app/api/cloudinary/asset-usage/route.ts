import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ImageArea } from '@/lib/cloudinary';

interface AssetUsage {
  page: string;
  component: string;
  usage: string;
}

// For Edge compatibility, this endpoint will return a static mapping
// of where assets are typically used based on their folder structure
export const runtime = 'edge';

export async function GET() {
  try {
    // Create a mapping of image areas to their typical usage in the application
    const areaToUsageMapping: Record<ImageArea, AssetUsage[]> = {
      'hero': [
        { page: '/', component: 'HeroSection', usage: 'Background image for homepage hero section' },
        { page: '/about', component: 'HeroSection', usage: 'Background image for about page hero' },
        { page: '/services', component: 'HeroSection', usage: 'Background image for services page hero' }
      ],
      'article': [
        { page: '/blog', component: 'ArticleCard', usage: 'Thumbnail for blog articles' },
        { page: '/blog/[article]', component: 'ArticlePage', usage: 'Header image for article content' }
      ],
      'service': [
        { page: '/services', component: 'ServiceCards', usage: 'Service category images' },
        { page: '/services/[service]', component: 'ServicePage', usage: 'Service detail page images' }
      ],
      'team': [
        { page: '/about', component: 'TeamSection', usage: 'Team member portraits' },
        { page: '/about/team', component: 'TeamPage', usage: 'Team member portraits on dedicated page' }
      ],
      'gallery': [
        { page: '/gallery', component: 'GalleryGrid', usage: 'Images displayed in the gallery page' },
        { page: '/patient-results', component: 'BeforeAfter', usage: 'Before and after treatment comparisons' }
      ],
      'logo': [
        { page: 'global', component: 'Header', usage: 'Site logo in navigation' },
        { page: 'global', component: 'Footer', usage: 'Site logo in footer' }
      ],
      'video-thumbnail': [
        { page: '/videos', component: 'VideoPlayer', usage: 'Video thumbnail image' },
        { page: '/testimonials', component: 'TestimonialVideo', usage: 'Testimonial video thumbnail' }
      ]
    };
    
    // Get current assets from Cloudinary API
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!apiKey || !apiSecret || !cloudName) {
      return NextResponse.json(
        { error: 'Missing Cloudinary credentials' },
        { status: 500 }
      );
    }
    
    // Authentication for Cloudinary API
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Fetch assets
    const searchUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expression: '',
        max_results: 500,
        sort_by: [{ created_at: 'desc' }],
        with_field: ['context', 'tags']
      })
    });
    
    if (!searchResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch assets from Cloudinary' },
        { status: searchResponse.status }
      );
    }
    
    const searchResult = await searchResponse.json();
    const assets = searchResult.resources || [];
    
    // Create a mapping of asset publicId to its usage
    const assetUsage: Record<string, AssetUsage[]> = {};
    
    assets.forEach((asset: any) => {
      const publicId = asset.public_id;
      const parts = publicId.split('/');
      
      if (parts.length > 0) {
        // Use the first part of the path as the area
        const area = parts[0] as ImageArea;
        
        if (areaToUsageMapping[area]) {
          assetUsage[publicId] = areaToUsageMapping[area];
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      usage: assetUsage,
      totalAssets: assets.length
    });
  } catch (error) {
    console.error('Error fetching asset usage:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch asset usage',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 