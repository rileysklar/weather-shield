import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-[url('/topo-light.svg')] dark:bg-[url('/topo-dark.svg')] bg-contain bg-center bg-no-repeat">
      {children}
    </div>
  );
} 