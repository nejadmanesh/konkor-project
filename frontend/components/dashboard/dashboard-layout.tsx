"use client"

import * as React from "react"
import { type ReactNode, useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { Button } from "@/components/ui/button"
import { useStudentStore } from "@/lib/store"
import { useRouter, usePathname } from "next/navigation"
import { getProfile } from "@/lib/api"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { logout, setStudent, name, grade, field, avatarUrl } = useStudentStore()
  const router = useRouter()
  const pathname = usePathname()
  const [allowLeave, setAllowLeave] = useState(false)
  const faDigits = (s: string) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])

  useEffect(() => {
    if (pathname !== "/dashboard") return
    history.pushState(null, "", location.href)
    const onPop = () => {
      if (!allowLeave && localStorage.getItem("access")) {
        setConfirmOpen(true)
        history.pushState(null, "", location.href)
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [pathname, allowLeave])

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access") || "" : ""
    if (!token) return
    getProfile(token)
      .then((data) => {
        const completed = Boolean(
          (data?.name || "") &&
          (data?.grade || "") &&
          (data?.field || "") &&
          Number(data?.daily_hours || 0) > 0 &&
          (data?.phone || "") &&
          (data?.address || "") &&
          (data?.birthdate_jalali || "")
        )
        const url = data?.avatar ? `${process.env.NEXT_PUBLIC_API_URL}${data.avatar}` : ""
        setStudent({
          name: data?.name || "",
          grade: data?.grade || "",
          field: data?.field || "",
          dailyHours: Number(data?.daily_hours || 0),
          phone: data?.phone || "",
          address: data?.address || "",
          birthdateJalali: data?.birthdate_jalali || "",
          profileCompleted: completed,
          avatarUrl: url,
        })
      })
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    setAllowLeave(true)
    logout()
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    localStorage.removeItem("profileCompleted")
    setConfirmOpen(false)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pr-64">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
        {pathname === "/dashboard" && (
          <div className="fixed bottom-4 right-4 z-20">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl shadow px-3 py-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold">{name?.[0] || "پ"}</span>
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium truncate">{name || "کاربر"}</div>
                <div className="text-muted-foreground truncate">{faDigits(grade || "") + (field ? " " + field : "")}</div>
              </div>
            </div>
          </div>
        )}
        <div className="fixed bottom-4 right-4 z-20">
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl shadow px-3 py-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold">{name?.[0] || "پ"}</span>
              )}
            </div>
            <div className="text-sm">
              <div className="font-medium truncate">{name || "کاربر"}</div>
              <div className="text-muted-foreground truncate">{grade || ""}</div>
            </div>
          </div>
        </div>
        <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/20" />
            <AlertDialog.Content className="fixed inset-0 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full">
                <AlertDialog.Title className="font-semibold mb-2">خروج از حساب</AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-muted-foreground mb-4">
                  می‌خواهید از حساب خارج شوید؟ با انصراف، بدون خروج به صفحه قبلی می‌روید.
                </AlertDialog.Description>
                <div className="flex justify-end gap-2">
                  <AlertDialog.Cancel asChild>
                    <Button variant="ghost" onClick={() => setConfirmOpen(false)}>ادامه</Button>
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
  )
}
