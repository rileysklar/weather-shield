'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { signOutAction } from '@/app/actions';

export default function HeaderAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUser();
  }, []);

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
  return user ? (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">{user.email?.split('@')[0]}</span>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"} size="sm" className="h-8 sm:h-9">
          Sign out
        </Button>
      </form>
    </div>
  ) : null;
}
