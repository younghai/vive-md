"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const fetchUser = useAuthStore((state) => state.fetchUser)

  useEffect(() => {
    if (!isAuthRoute) {
      fetchUser()
    }
  }, [fetchUser, isAuthRoute])

  if (isAuthRoute) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
            <SidebarTrigger />
            <div className="w-full flex-1">
              <h1 className="font-semibold text-lg">VIVE CRM</h1>
            </div>
            {/* TODO: Notifications, User Profile */}
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
