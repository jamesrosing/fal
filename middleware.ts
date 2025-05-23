import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

// Protected admin routes that require authentication
const PROTECTED_ADMIN_ROUTES = [
  '/admin',
  '/admin/articles',
  '/admin/gallery',
  '/admin/team',
  '/admin/media',
  '/admin/visual-editor',
  '/admin/upload',
  '/admin/zenoti',
];

// Routes that require authentication for regular users
const PROTECTED_USER_ROUTES = [
  '/appointment/booking', // Only the actual booking process requires authentication
  '/profile',            // User profile management
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response
  const response = NextResponse.next();
  
  // Create a Supabase client using the new ssr package
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
  
  // Get the user's session - use getUser instead of getSession for better accuracy
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  // Check if path requires authentication (admin routes)
  if (PROTECTED_ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    // Log to help debug redirects
    console.log('[Middleware] Admin route detected:', pathname);
    console.log('[Middleware] User:', user?.email);
    
    // If no user, redirect to login
    if (!user) {
      console.log('[Middleware] No user found, redirecting to login');
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // Check if user has admin role for admin routes
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('[Middleware] Profile query result:', { profile, error });
      
      if (error) {
        console.error('[Middleware] Error fetching user profile:', error);
        // If profile doesn't exist, redirect to login to re-authenticate
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      if (!profile) {
        console.log('[Middleware] No user profile found, redirecting to login');
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      if (profile.role !== 'admin' && profile.role !== 'super_admin') {
        console.log(`[Middleware] User role is ${profile.role}, not admin. Redirecting to homepage`);
        // For non-admin users, redirect to homepage with a message
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('message', 'unauthorized');
        return NextResponse.redirect(url);
      }
      
      // User is authenticated and has admin role - allow access
      console.log('[Middleware] Admin access granted');
    } catch (error) {
      console.error('[Middleware] Unexpected error checking admin role:', error);
      // On unexpected error, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Check if route requires normal user authentication
  if (PROTECTED_USER_ROUTES.some(route => pathname.startsWith(route))) {
    // If no user, redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Only apply under-construction redirects in production environment
  // Skip redirects in development environment
  if (process.env.NODE_ENV === 'production') {
    // Check if the current path is in the list of incomplete paths
    const isIncompletePath = INCOMPLETE_PATHS.some(path => pathname.startsWith(path));
    
    // Check if the path with query parameters should be redirected
    const shouldRedirectQueryPath = shouldRedirectPath(pathname, request.nextUrl.search);
    
    if (isIncompletePath || shouldRedirectQueryPath) {
      // Create a new URL for the under-construction page
      const url = request.nextUrl.clone();
      url.pathname = '/under-construction';
      // Clear any query parameters
      url.search = '';
      return NextResponse.redirect(url);
    }
  }
  
  // Add redirect for old plastic surgery page to new path
  if (pathname === '/plastic-surgery') {
    const url = request.nextUrl.clone();
    url.pathname = '/services/plastic-surgery';
    return NextResponse.redirect(url);
  }
  
  return response;
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
    '/admin/:path*',
    '/auth/:path*',
    '/profile/:path*',
  ],
}; 