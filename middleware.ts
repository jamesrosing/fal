import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of specific paths that are incomplete and should redirect to under-construction
const INCOMPLETE_PATHS = [
  '/gallery/before-after',
  '/services/functional-medicine',
  '/chat',
  '/team',
  '/upload',
  '/reviews',
  '/out-of-town',
  // Add more incomplete paths as needed
];

// Function to check if a path with specific query parameters should be redirected
function shouldRedirectPath(pathname: string, search: string): boolean {
  // Check specific path and query combinations that are incomplete
  const pathAndQueryCombinations = [
    // Plastic Surgery sections via query params
    { path: '/services/plastic-surgery', query: 'section=face' },
    { path: '/services/plastic-surgery', query: 'section=neck' },
    { path: '/services/plastic-surgery', query: 'section=body' },
    
    // Dermatology sections via query params
    { path: '/services/dermatology', query: 'section=medical' },
    { path: '/services/dermatology', query: 'section=cosmetic' },
    
    // Medical Spa sections via query params
    { path: '/services/medical-spa', query: 'section=injectables' },
    { path: '/services/medical-spa', query: 'section=laser' },
    { path: '/services/medical-spa', query: 'section=skincare' },
    
    // Appointment scheduling
    { path: '/appointment', query: 'schedule=true' },
  ];
  
  return pathAndQueryCombinations.some(combo => 
    pathname === combo.path && search.includes(combo.query)
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Check if the current path is in the list of incomplete paths
  const isIncompletePath = INCOMPLETE_PATHS.some(path => pathname.startsWith(path));
  
  // Check if the path with query parameters should be redirected
  const shouldRedirectQueryPath = shouldRedirectPath(pathname, search);
  
  if (isIncompletePath || shouldRedirectQueryPath) {
    // Create a new URL for the under-construction page
    const url = request.nextUrl.clone();
    url.pathname = '/under-construction';
    // Clear any query parameters
    url.search = '';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Only run this middleware on specific paths to avoid unnecessary processing
export const config = {
  matcher: [
    '/gallery/:path*',
    '/services/:path*',
    '/appointment/:path*',
    '/chat/:path*',
    '/team/:path*',
    '/upload/:path*',
    '/reviews/:path*',
    '/out-of-town/:path*',
  ],
}; 