import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
throw new Error('Missing Supabase environment variables');
}

// Create a client for use on the client side
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create a function to get a server-side client (for server components and API routes)
export const getServerSupabaseClient = async () => {
const { cookies } = await import('next/headers');
const cookieStore = cookies();

// Create a new Supabase client for server-side use
return createClient<Database>(
supabaseUrl,
supabaseAnonKey,
{
auth: {
persistSession: false,
detectSessionInUrl: false,
autoRefreshToken: false,
},
global: {
headers: {
'Cookie': cookieStore.toString(),
},
},
}
);
};

// Helper for handling Supabase errors
export const handleSupabaseError = (error: unknown) => {
console.error('Supabase error:', error);
return {
error: typeof error === 'object' && error !== null && 'message' in error
? String(error.message)
: 'An unknown error occurred',
};
};