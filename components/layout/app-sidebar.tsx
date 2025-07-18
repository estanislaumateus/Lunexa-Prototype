"use client"

import {
  BookOpen,
  Calendar,
  ClipboardList,
  Home,
  MessageSquare,
  History,
  Bell,
  Settings,
  GraduationCap,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Área de Estudo",
    url: "/dashboard/study",
    icon: BookOpen,
  },
  {
    title: "Chat com IA",
    url: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Histórico",
    url: "/dashboard/history",
    icon: History,
  },
  {
    title: "Calendário",
    url: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Avaliações",
    url: "/dashboard/assessments",
    icon: ClipboardList,
  },
  {
    title: "Notificações",
    url: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">Lunexa</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="p-4 text-sm text-muted-foreground">© 2025 Lunexa</div>
      </SidebarFooter>
    </Sidebar>
  )
}
