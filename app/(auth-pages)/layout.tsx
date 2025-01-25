export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        {children}
      </div>
    </div>
  )
}
