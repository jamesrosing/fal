import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type CookieOptions } from '@supabase/ssr';

/**
 * Supabase Server Client
 * 
 * This module provides functions to create different Supabase clients
 * for server components and API routes
 */

export async function createServerComponentClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Can't set cookies in a Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch (error) {
            // Can't remove cookies in a Server Component
          }
        },
      },
    }
  );
}

// Wrapper function for API routes to create a server client
export async function createRouteHandlerClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // This won't work in route handlers, as they are read-only
          // This is just to satisfy the interface
        },
        remove(name: string, options: CookieOptions) {
          // This won't work in route handlers, as they are read-only
          // This is just to satisfy the interface
        },
      },
    }
  );
}

// Create a Supabase service role client for admin operations
export async function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return undefined; // Service role client doesn't use cookies
        },
        set(name: string, value: string, options: CookieOptions) {
          // Service role client doesn't use cookies
        },
        remove(name: string, options: CookieOptions) {
          // Service role client doesn't use cookies
        },
      },
    }
  );
}

export default {
  createServerComponentClient,
  createRouteHandlerClient,
  createServiceRoleClient
}; 