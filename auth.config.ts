import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { createClient } from "@/utils/supabase/server"

export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (error || !user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnProtected = nextUrl.pathname.startsWith("/protected")
      const isOnAuth = nextUrl.pathname.startsWith("/sign-in") || 
                      nextUrl.pathname.startsWith("/sign-up")

      // If on auth pages and logged in, redirect to protected
      if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL("/protected", nextUrl))
      }

      // If on protected pages and not logged in, block access
      if (isOnProtected && !isLoggedIn) {
        return false
      }

      return true
    },
    jwt({ token, user }) {
      if (user) token.user = user
      return token
    },
    session({ session, token }) {
      session.user = token.user as any
      return session
    }
  }
} satisfies NextAuthConfig
