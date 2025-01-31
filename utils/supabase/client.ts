import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/supabase/database.types';
import { validateEnv } from '@/utils/env';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () => {
  // During static generation or SSG, return a mock client
  if (typeof window === 'undefined') {
    return createBrowserClient<Database>(
      'https://mock-url.supabase.co',
      'mock-key'
    );
  }

  if (!validateEnv()) {
    throw new Error(
      'Missing required environment variables for Supabase client creation. ' +
      'Check your .env file or environment configuration.'
    );
  }

  return createBrowserClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!
  );
};
