import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect root to sign-in page
  redirect("/sign-in");
}
