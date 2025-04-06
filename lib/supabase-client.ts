// lib/supabase-client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs/client';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs/server';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs/server';
import { Database } from './database.types';
import { redirect } from 'next/navigation';

/**
 * Creates a Supabase client for server components
 * Compatible with Next.js 15 async APIs
 */
export async function createServerClient() {
  const cookies = await import('next/headers').then(mod => mod.cookies);
  return createServerComponentClient<Database>({ cookies });
}

/**
 * Creates a Supabase client for server actions
 * Compatible with Next.js 15 async APIs
 */
export async function createActionClient() {
  const cookies = await import('next/headers').then(mod => mod.cookies);
  return createServerActionClient<Database>({ cookies });
}

/**
 * Creates a Supabase client for client components
 */
export function createBrowserClient() {
  return createClientComponentClient<Database>();
}

/**
 * Get the current user session from server components
 * Compatible with Next.js 15 async APIs
 */
export async function getSession() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Require authentication or redirect to login
 * Compatible with Next.js 15 async APIs
 */
export async function requireAuth(redirectTo = '/auth/login') {
  const session = await getSession();
  
  if (!session) {
    redirect(redirectTo);
  }
  
  return session;
}

/**
 * Get current user from server components
 * Compatible with Next.js 15 async APIs
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}
