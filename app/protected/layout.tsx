import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getSession() {
  const supabase = await createClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.warn('Error getting session:', error);
    return null;
  }
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-[url('/topo-light.svg')] dark:bg-[url('/topo-dark.svg')] bg-contain bg-center bg-no-repeat">
      {children}
    </div>
  );
} 