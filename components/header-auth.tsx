import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div>
          <Badge
            variant={"default"}
            className="font-normal pointer-events-none text-xs sm:text-sm"
          >
            Please update .env.local file with anon key and url
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            variant={"outline"}
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={"default"}
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }
  return user ? (
    <div className="flex items-center gap-2 sm:gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">{user.email}</span>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"} size="sm" className="h-8 sm:h-9">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Sign out</span>
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"} className="h-8 sm:h-9">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"} className="h-8 sm:h-9">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
