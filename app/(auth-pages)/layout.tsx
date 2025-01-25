export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[url('/topo-light.svg')] dark:bg-[url('/topo-dark.svg')] bg-contain bg-center bg-no-repeat">
      <div className="w-full max-w-sm bg-glass backdrop-blur-sm p-8 rounded-lg shadow-lg border border-foreground/10">
        {children}
      </div>
    </div>
  )
}
