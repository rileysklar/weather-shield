'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
