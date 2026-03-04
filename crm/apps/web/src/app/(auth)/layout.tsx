export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">VIVE CRM</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
