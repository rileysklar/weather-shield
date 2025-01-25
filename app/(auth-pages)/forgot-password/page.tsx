import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Testimonial } from "@/components/testimonial";
import { AuthFormWrapper } from "@/components/auth-form-wrapper";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex flex-col space-y-6">
      <AuthFormWrapper>
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-8 w-8" />
          <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
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
            <SubmitButton formAction={forgotPasswordAction} className="w-full" pendingText="Sending reset link...">
              Send reset link
            </SubmitButton>
            <FormMessage message={searchParams} />
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/sign-in" className="hover:text-brand underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </AuthFormWrapper>
      <Testimonial />
    </div>
  );
}
