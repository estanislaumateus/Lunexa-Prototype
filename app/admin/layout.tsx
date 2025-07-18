import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Header } from "@/components/layout/header"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Users, BookText, BarChart2 } from "lucide-react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

const adminNavItems = [
    { href: "/admin/dashboard", icon: <BarChart2 className="h-5 w-5" />, text: "Dashboard" },
    { href: "/admin/users", icon: <Users className="h-5 w-5" />, text: "Usuários" },
    { href: "/admin/topics", icon: <BookText className="h-5 w-5" />, text: "Tópicos" },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        redirect('/dashboard');
    }

  return (
    <SidebarProvider>
        <div className="grid min-h-screen w-full grid-cols-[240px_1fr]">
            <AdminSidebar navItems={adminNavItems} title="Admin Panel" />
            <div className="flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    </SidebarProvider>
  )
} 