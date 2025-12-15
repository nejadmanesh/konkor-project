"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiRequest, getProfile, testConnection } from "@/lib/api"
import { useStudentStore } from "@/lib/store"
import { useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"email" | "code">("email")
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { setStudent } = useStudentStore()

  // تست اتصال به backend هنگام لود صفحه
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const connected = await testConnection()
        setBackendConnected(connected)
        if (!connected) {
          // فقط یک بار toast نمایش بده
          console.warn('Backend در حال اجرا نیست. لطفاً با دستور زیر آن را اجرا کنید: cd backend && python manage.py runserver')
        }
      } catch (error) {
        console.error('خطا در بررسی اتصال به backend:', error)
        setBackendConnected(false)
      }
    }
    
    // کمی تاخیر برای اینکه صفحه لود شود
    const timer = setTimeout(() => {
      checkBackend()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // ارسال کد OTP به ایمیل
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // اعتبارسنجی ساده ایمیل
    if (!email || !email.includes('@')) {
      toast({
        title: "خطا",
        description: "لطفاً یک ایمیل معتبر وارد کنید.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await apiRequest("/api/auth/send-otp/", "POST", { email })

      toast({
        title: "کد ارسال شد",
        description: response.email_sent 
          ? "کد ورود به ایمیل شما ارسال شد." 
          : "کد ورود در ترمینال سرور نمایش داده شد. (برای تست)",
      })

      setStep("code")
      setCode("") // پاک کردن کد قبلی
    } catch (error: any) {
      console.error("خطا در ارسال OTP:", error)
      toast({
        title: "خطا",
        description: error.message || "ارسال کد انجام نشد. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // تأیید کد و لاگین
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // اعتبارسنجی کد
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      toast({
        title: "خطا",
        description: "لطفاً کد ۶ رقمی را به درستی وارد کنید.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const res = await apiRequest("/api/auth/verify-otp/", "POST", { email, code })

      if (!res.access || !res.refresh) {
        throw new Error("پاسخ نامعتبر از سرور")
      }

      // ذخیره tokens
      localStorage.setItem("access", res.access)
      localStorage.setItem("refresh", res.refresh)

      // بررسی وضعیت پروفایل
      let completed = false
      try {
        const data = await getProfile(res.access)
        completed = Boolean(
          data?.name &&
          data?.grade &&
          data?.field &&
          Number(data?.daily_hours || 0) > 0 &&
          data?.phone &&
          data?.address &&
          data?.birthdate_jalali
        )
      } catch (profileError) {
        console.warn("خطا در دریافت پروفایل:", profileError)
        // اگر خطا در دریافت پروفایل باشد، کاربر جدید است
        completed = false
      }

      setStudent({ profileCompleted: completed })
      localStorage.setItem("profileCompleted", completed ? "true" : "false")

      toast({
        title: "ورود موفق",
        description: res.is_new_user 
          ? "حساب کاربری شما ایجاد شد. لطفاً پروفایل را تکمیل کنید." 
          : completed 
            ? "در حال ورود به داشبورد..." 
            : "لطفاً پروفایل را تکمیل کنید",
      })

      // هدایت به صفحه مناسب
      setTimeout(() => {
        router.push(completed ? "/dashboard" : "/profile")
      }, 1000)
    } catch (error: any) {
      console.error("خطا در تأیید OTP:", error)
      toast({
        title: "خطا در ورود",
        description: error.message || "کد وارد شده اشتباه است. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      })
      // در صورت خطا، کد را پاک نکنیم تا کاربر بتواند دوباره تلاش کند
    } finally {
      setLoading(false)
    }
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
            <CardTitle className="text-2xl">ورود به حساب کاربری</CardTitle>
            <CardDescription>برای ورود ایمیل خود را وارد کنید</CardDescription>
          </CardHeader>

          <CardContent>
            {/* نمایش وضعیت اتصال به backend */}
            {backendConnected === false && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm text-red-700 dark:text-red-300">
                <p className="font-medium mb-1">⚠️ سرور در دسترس نیست</p>
                <p className="text-xs">لطفاً مطمئن شوید که backend Django در حال اجرا است:</p>
                <code className="text-xs block mt-1 bg-red-100 dark:bg-red-900/40 p-1 rounded">
                  cd backend && python manage.py runserver
                </code>
              </div>
            )}
            
            {step === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ایمیل خود را وارد کنید"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || backendConnected === false}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || backendConnected === false}
                >
                  {loading ? "در حال ارسال..." : "ارسال کد ورود"}
                </Button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">کد ورود</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="کد ۶ رقمی"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "در حال بررسی..." : "ورود"}
                </Button>

                <div className="text-sm text-center mt-3">
                  <span className="text-muted-foreground">کد دریافت نکردید؟ </span>
                  <button
                    type="button"
                    className="text-primary hover:underline disabled:opacity-50"
                    onClick={(e) => {
                      e.preventDefault()
                      handleSendOTP(e as any)
                    }}
                    disabled={loading}
                  >
                    ارسال دوباره کد
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">💡 نکته:</p>
                  <p>در محیط تست، کد OTP در ترمینال سرور نمایش داده می‌شود.</p>
                </div>
              </form>
            )}

            {step === "code" && (
              <div className="mt-6 text-center text-sm">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setStep("email")}
                >
                  بازگشت به مرحله قبل
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
