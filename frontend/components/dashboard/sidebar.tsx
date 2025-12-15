"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Brain, LayoutDashboard, Calendar, BookOpen, BarChart3, Settings, X, LogOut } from "lucide-react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { useStudentStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
  { name: "برنامه‌ریزی", href: "/planner/board", icon: Calendar },
  { name: "دروس", href: "/lessons", icon: BookOpen },
  { name: "گزارش‌ها", href: "/analytics", icon: BarChart3 },
  { name: "پروفایل", href: "/profile", icon: Settings },
  { name: "تنظیمات", href: "/settings", icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout, name, grade, field } = useStudentStore()
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const faDigits = (s: string) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])

  const handleLogout = () => {
    logout()
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    localStorage.removeItem("profileCompleted")
    router.push("/")
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-card border-l border-border z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              <span className="font-bold text-lg">برنامه‌ریز</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={onClose}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {(name?.[0] || "پ")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{name || "کاربر"}</p>
                <p className="text-xs text-muted-foreground truncate">{faDigits(grade || "") + (field ? " " + field : "")}</p>
              </div>
            </div>
            <div className="mt-3">
              <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialog.Trigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <LogOut className="w-5 h-5" /> خروج از حساب
                  </Button>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay className="fixed inset-0 bg-black/20" />
                  <AlertDialog.Content className="fixed inset-0 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full">
                      <AlertDialog.Title className="font-semibold mb-2">خروج از حساب</AlertDialog.Title>
                      <AlertDialog.Description className="text-sm text-muted-foreground mb-4">
                        آیا مطمئن هستید که می‌خواهید خارج شوید؟
                      </AlertDialog.Description>
                      <div className="flex justify-end gap-2">
                        <AlertDialog.Cancel asChild>
                          <Button variant="ghost">انصراف</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <Button variant="destructive" onClick={handleLogout}>خروج</Button>
                        </AlertDialog.Action>
                      </div>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
