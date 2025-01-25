import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default async function LoginPage() {
  const session = await auth()
  
  if (session?.user) {
    redirect("/protected")
  }

  return (
    <div className="min-h-screen topo-bg flex items-center justify-center">
      <Card className="p-6 w-full max-w-sm backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form action="/api/auth/signin/credentials" method="POST">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                className="w-full p-2 rounded border bg-white/50 dark:bg-gray-800/50"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                className="w-full p-2 rounded border bg-white/50 dark:bg-gray-800/50"
                placeholder="password"
                required
              />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </div>
        </form>
      </Card>
    </div>
  )
} 