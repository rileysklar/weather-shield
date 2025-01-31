'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'
import { validateEnv } from '@/utils/env'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  if (!validateEnv()) {
    throw new Error(
      'Missing required environment variables for Supabase client creation. ' +
      'Check your .env file or environment configuration.'
    );
  }

  return createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          (await cookies()).set({ name, value, ...options })
        },
        async remove(name: string, options: CookieOptions) {
          (await cookies()).set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    }
  )
}
