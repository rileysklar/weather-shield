import { Database } from '@/lib/supabase/database.types';

export const createMockClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
      error: null
    }),
    signInWithPassword: async () => ({ data: null, error: new Error('Auth not available') }),
    signOut: async () => ({ error: null }),
    exchangeCodeForSession: async () => ({ data: { session: null }, error: new Error('Auth not available') })
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: new Error('Database not available') }),
    update: () => Promise.resolve({ data: null, error: new Error('Database not available') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Database not available') })
  })
}); 
