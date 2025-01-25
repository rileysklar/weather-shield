import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Testimonial } from "@/components/testimonial";
import { AuthFormWrapper } from "@/components/auth-form-wrapper";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="flex flex-col space-y-6">
      <AuthFormWrapper>
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-8 w-8" />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>
        <div className="grid gap-6 mt-6">
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/90"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            <SubmitButton formAction={signInAction} className="w-full" pendingText="Signing in...">
              Sign in
            </SubmitButton>
            <FormMessage message={searchParams} />
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/sign-up" className="hover:text-brand underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </AuthFormWrapper>
      <Testimonial />
    </div>
  );
}
