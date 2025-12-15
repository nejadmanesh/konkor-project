"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sendOTP, verifyOTP, getProfile, updateProfile } from "@/lib/api"
import { useStudentStore } from "@/lib/store"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"info" | "code">("info")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { setStudent } = useStudentStore()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendOTP(email)
      toast({ title: "کد ارسال شد", description: "کد تایید به ایمیل شما ارسال شد." })
      setStep("code")
    } catch (error: any) {
      toast({ title: "خطا در ارسال کد", description: error?.message || "ارسال کد انجام نشد.", variant: "destructive" })
    }
    setLoading(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await verifyOTP(email, code)
      localStorage.setItem("access", res.access)
      localStorage.setItem("refresh", res.refresh)

      if (res.is_new_user) {
        try {
          await updateProfile({ name }, res.access)
        } catch {}
      }

      let completed = false
      try {
        const data = await getProfile(res.access)
        completed = Boolean(
          (data?.name || "") &&
          (data?.grade || "") &&
          (data?.field || "") &&
          Number(data?.daily_hours || 0) > 0 &&
          (data?.phone || "") &&
          (data?.address || "") &&
          (data?.birthdate_jalali || "")
        )
      } catch {}

      setStudent({ profileCompleted: completed })
      localStorage.setItem("profileCompleted", completed ? "true" : "false")

      toast({
        title: "ورود موفق",
        description: completed ? "در حال ورود به داشبورد..." : "لطفاً پروفایل را تکمیل کنید",
      })

      router.push("/profile")
    } catch (error: any) {
      toast({ title: "خطا در تأیید", description: error?.message || "کد نامعتبر است.", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Brain className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold">برنامه‌ریز هوشمند</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">ثبت‌نام رایگان</CardTitle>
            <CardDescription>حساب کاربری خود را برای شروع ایجاد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            {step === "info" && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام و نام خانوادگی</Label>
                  <Input id="name" type="text" placeholder="نام شما" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input id="email" type="email" placeholder="ایمیل خود را وارد کنید" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "در حال ارسال..." : "ارسال کد تایید"}
                  {!loading && <ArrowLeft className="w-4 h-4 mr-2" />}
                </Button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">کد تایید</Label>
                  <Input id="code" type="text" placeholder="کد ۶ رقمی" value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "در حال بررسی..." : "تایید و ساخت حساب"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">قبلاً ثبت‌نام کرده‌اید؟ </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                ورود به حساب
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
