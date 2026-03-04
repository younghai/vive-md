"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Home, Users, Briefcase, CheckSquare, Activity, BarChart, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

const navigation = [
  { name: "대시보드", href: "/", icon: Home },
  { name: "고객 목록", href: "/contacts", icon: Users },
  { name: "딜 파이프라인", href: "/deals", icon: Briefcase },
  { name: "작업", href: "/tasks", icon: CheckSquare },
  { name: "활동 로그", href: "/activities", icon: Activity },
  { name: "리포트", href: "/reports", icon: BarChart },
  { name: "설정", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold">VIVE CRM</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button onClick={() => {
                useAuthStore.getState().logout()
                window.location.href = '/login'
              }}>
                <LogOut />
                <span>로그아웃</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
