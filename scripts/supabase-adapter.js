import pkg from '@supabase/ssr';
import dotenv from 'dotenv';

const { createBrowserClient } = pkg;

// Load environment variables
dotenv.config();

// Create a Supabase client
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Create an export for IMAGE_ASSETS as an empty object if needed
export const IMAGE_ASSETS = {}; 