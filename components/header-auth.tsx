'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { signOutAction } from '@/app/actions';
import { useSearchParams } from 'next/navigation';

export default function HeaderAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for auth callback
    const checkAuthCallback = async () => {
      const code = searchParams.get('code');
      if (code) {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && session) {
          setUser(session.user);
        }
        setLoading(false);
      }
    };
    checkAuthCallback();

    // Immediately check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <a href="/sign-in">Sign In</a>
        </Button>
        <Button asChild size="sm">
          <a href="/sign-up">Sign Up</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">
        {user.email?.split('@')[0]}
      </span>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"} size="sm" className="h-8 sm:h-9">
          Sign out
        </Button>
      </form>
    </div>
  );
}
