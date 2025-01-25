import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  
  // If authenticated, go to protected dashboard
  if (session?.user) {
    redirect("/protected");
  }
  
  // If not authenticated, go to login
  redirect("/login");
}
