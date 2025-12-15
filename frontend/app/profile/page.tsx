"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import CropModal from "@/components/CropModal"
import { useStudentStore } from "@/lib/store"
import DatePicker from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import { useRef } from "react"
import { getProfile, updateProfile } from "@/lib/api"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { name, grade, field, dailyHours, phone, address, birthdateJalali, profileCompleted, setStudent } = useStudentStore()
  const [localName, setLocalName] = useState(name)
  const [localGrade, setLocalGrade] = useState(grade)
  const [localField, setLocalField] = useState(field)
  const [localDailyHours, setLocalDailyHours] = useState<number>(dailyHours)
  const [localPhone, setLocalPhone] = useState(phone)
  const [localAddress, setLocalAddress] = useState(address)
  const [localBirthdate, setLocalBirthdate] = useState<string>(birthdateJalali)

  const [avatar, setAvatar] = useState<string | null>(null)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [showCrop, setShowCrop] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const { toast } = useToast()
  const router = useRouter()
  const allRequiredFilled = !!localName && !!localGrade && !!localField && localDailyHours > 0 && !!localPhone && !!localAddress && !!localBirthdate

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setCropImage(result)
      setShowCrop(true)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access") || "" : ""
    if (!token) return
    getProfile(token)
      .then((data) => {
        setLocalName(data.name || "")
        setLocalGrade(data.grade || "")
        setLocalField(data.field || "")
        setLocalDailyHours(Number(data.daily_hours || 0))
        setLocalPhone(data.phone || "")
        setLocalAddress(data.address || "")
        setLocalBirthdate(data.birthdate_jalali || "")
      })
      .catch(() => {})
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const requiredFilled =
      !!localName && !!localGrade && !!localField && localDailyHours > 0 && !!localPhone && !!localAddress && !!localBirthdate
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") || "" : ""
      if (token) {
        await updateProfile(
          {
            name: localName,
            grade: localGrade,
            field: localField,
            daily_hours: localDailyHours,
            phone: localPhone,
            address: localAddress,
            birthdate_jalali: localBirthdate,
          },
          token,
        )
      }
    } catch {}

    setStudent({
      name: localName,
      grade: localGrade,
      field: localField,
      dailyHours: localDailyHours,
      phone: localPhone,
      address: localAddress,
      birthdateJalali: localBirthdate,
      profileCompleted: requiredFilled,
    })
    localStorage.setItem("profileCompleted", requiredFilled ? "true" : "false")
    toast({ title: requiredFilled ? "ذخیره شد" : "نیاز به تکمیل", description: requiredFilled ? "اطلاعات پروفایل با موفقیت ذخیره شد." : "برای تکمیل پروفایل همه فیلدها را پر کنید." })
    if (requiredFilled) {
      router.push("/dashboard")
    }
  }

  const initials = localName?.trim()?.[0] || "پ"

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">پروفایل</h1>
          <p className="text-muted-foreground">مشاهده و ویرایش اطلاعات شخصی</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>اطلاعات کاربر</CardTitle>
            <CardDescription>نام، پایه، رشته و ساعات مطالعه روزانه</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>تصویر پروفایل</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border border-border flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold">{initials}</span>
                    )}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                    <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>آپلود عکس</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">نام و نام خانوادگی</Label>
                <Input id="name" value={localName} onChange={(e) => setLocalName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">پایه تحصیلی</Label>
                <Select value={localGrade} onValueChange={(v) => setLocalGrade(v)}>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="انتخاب پایه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">دهم</SelectItem>
                    <SelectItem value="11">یازدهم</SelectItem>
                    <SelectItem value="12">دوازدهم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field">رشته تحصیلی</Label>
                <Select value={localField} onValueChange={(v) => setLocalField(v)}>
                  <SelectTrigger id="field">
                    <SelectValue placeholder="انتخاب رشته" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ریاضی">ریاضی</SelectItem>
                    <SelectItem value="تجربی">تجربی</SelectItem>
                    <SelectItem value="انسانی">انسانی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">ساعات مطالعه روزانه</Label>
                <Input id="hours" type="number" min={1} max={24} value={localDailyHours} onChange={(e) => setLocalDailyHours(Number(e.target.value))} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">شماره تماس</Label>
                <Input id="phone" value={localPhone} onChange={(e) => setLocalPhone(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>تاریخ تولد (شمسی)</Label>
                <DatePicker
                  value={localBirthdate || undefined}
                  onChange={(val: any) => {
                    const v = Array.isArray(val) ? val[0] : val
                    const formatted = v?.format ? v.format("YYYY/MM/DD") : ""
                    setLocalBirthdate(formatted)
                  }}
                  calendar={persian}
                  locale={persian_fa}
                  inputClass="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  format="YYYY/MM/DD"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">آدرس</Label>
                <Input id="address" value={localAddress} onChange={(e) => setLocalAddress(e.target.value)} required />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={!allRequiredFilled}>ذخیره</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {showCrop && cropImage && (
          <CropModal
            image={cropImage}
            onCancel={() => setShowCrop(false)}
            onSave={(img: string) => {
              setAvatar(img)
              setShowCrop(false)
            }}
            targetSize={256}
          />
        )}
      </div>
    </DashboardLayout>
  )
}