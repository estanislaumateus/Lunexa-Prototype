"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"

export function AdminSidebar({ navItems, title }: { navItems: { href: string; icon: React.ReactNode; text: string }[], title: string }) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
            <div className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-semibold">{title}</span>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 p-4">
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                    <Button
                        variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                    >
                        {item.icon}
                        <span className="text-md">{item.text}</span>
                    </Button>
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </Sidebar>
  )
} 