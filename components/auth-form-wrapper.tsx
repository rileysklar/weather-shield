import { cn } from "@/lib/utils";

interface AuthFormWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthFormWrapper({ children, className }: AuthFormWrapperProps) {
  return (
    <div className={cn(
      "relative w-full max-w-[400px] p-6 rounded-xl",
      "bg-background/30 backdrop-blur-md border shadow-lg",
      "dark:bg-background/20",
      className
    )}>
      {children}
    </div>
  );
} 