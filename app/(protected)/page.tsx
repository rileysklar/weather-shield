import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function ProtectedPage() {
  const session = await auth();

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="flex flex-col gap-8 max-w-5xl p-8 w-full">
        <h1 className={cn(
          "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
          "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
        )}>
          My App
        </h1>
        
        {/* Weather Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4">Current Weather</h2>
            <div className="space-y-2">
              <p className="text-4xl font-bold">72°F</p>
              <p className="text-gray-600 dark:text-gray-300">Sunny</p>
              <p className="text-sm">New York City, NY</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 