"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Menu, Bell, Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useStudentStore } from "@/lib/store"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { useRouter } from "next/navigation"
import { getNotifications, sendTestNotification } from "@/lib/api"

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { name, logout } = useStudentStore()
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<{ id: number; title: string; body: string; created_at: string }[]>([])

  const handleLogout = () => {
    logout()
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    localStorage.removeItem("profileCompleted")
    router.push("/")
  }

  useEffect(() => {
    setMounted(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("access") || "" : ""
    if (token) {
      getNotifications(token).then(setNotifs).catch(() => {})
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">خوش آمدید، {name || "کاربر"}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("fa-IR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <Button variant="ghost" size="icon" onClick={() => setNotifOpen((v) => !v)}>
            <Bell className="w-5 h-5" />
          </Button>
          {notifOpen && (
            <div className="absolute top-10 left-0 w-72 bg-card border border-border rounded-md shadow-md p-2 z-50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">اعلان‌ها</div>
                <Button variant="ghost" size="sm" onClick={async () => {
                  const token = typeof window !== "undefined" ? localStorage.getItem("access") || "" : ""
                  if (!token) return
                  await sendTestNotification(token, { title: "نمونه اعلان", body: "این یک اعلان تستی است" })
                  const list = await getNotifications(token)
                  setNotifs(list)
                }}>ارسال تست</Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {notifs.length === 0 && <div className="text-sm text-muted-foreground">اعلان جدیدی نیست</div>}
                {notifs.map((n) => (
                  <div key={n.id} className="p-2 rounded-md hover:bg-muted">
                    <div className="text-sm font-medium truncate">{n.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{n.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mounted && (
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          )}
          <Link href="/profile">
            <Button variant="secondary" className="hidden md:inline-flex">پروفایل</Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" className="md:hidden">
              {(name?.[0] || "پ")}
            </Button>
          </Link>
          <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialog.Trigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" /> خروج
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
    </header>
  )
}
