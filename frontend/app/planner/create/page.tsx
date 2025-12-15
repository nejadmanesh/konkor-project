"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createPlannerRequest, submitPlannerRequest, getPlannerForLLM } from "@/lib/api"

export default function CreatePlanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [examProvider, setExamProvider] = useState("")
  const [examDate, setExamDate] = useState("")
  const examDateOptions: Record<string, { value: string; label: string }[]> = {
    ghalamchi: [
      { value: "1404-09-02", label: "۲ آذر" },
      { value: "1404-09-16", label: "۱۶ آذر" },
    ],
    gaj: [
      { value: "1404-09-16", label: "۱۶ آذر" },
      { value: "1404-09-30", label: "۳۰ آذر" },
    ],
  }
  const [dailyHours, setDailyHours] = useState<number>(8)
  const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]
  const [school, setSchool] = useState(days.map((d) => ({ day: d, has: false, start: "07:00", end: "12:00" })))
  const [hasExistingSchoolPlan, setHasExistingSchoolPlan] = useState(false)
  const [schoolCollapsed, setSchoolCollapsed] = useState(false)
  const [schoolTarget, setSchoolTarget] = useState<"base" | "week1" | "week2">("base")
  const [week1, setWeek1] = useState(days.map((d) => ({ day: d, has: false, start: "07:00", end: "12:00" })))
  const [week2, setWeek2] = useState(days.map((d) => ({ day: d, has: false, start: "07:00", end: "12:00" })))
  const [classes, setClasses] = useState<Array<{ lesson: string; day: string; start: string; end: string }>>([])
  const [subjects, setSubjects] = useState<Record<string, { checked: boolean; level: "weak" | "mid" | "strong" }>>({
    زیست: { checked: false, level: "mid" },
    شیمی: { checked: false, level: "mid" },
    فیزیک: { checked: false, level: "mid" },
    ریاضی: { checked: false, level: "mid" },
  })
  const [commitments, setCommitments] = useState<Array<{ text: string; minutes: number }>>([])
  const [lightEnabled, setLightEnabled] = useState(false)
  const [lightDay, setLightDay] = useState<string>("جمعه")
  const [generals, setGenerals] = useState<Record<string, { days: number; target?: number }>>({
    فارسی: { days: 0, target: undefined },
    عربی: { days: 0, target: undefined },
    "دین و زندگی": { days: 0, target: undefined },
    زبان: { days: 0, target: undefined },
  })
  const [saving, setSaving] = useState(false)
  const [requestId, setRequestId] = useState<number | null>(null)

  // ذخیره خودکار داده‌ها به صورت draft
  useEffect(() => {
    const autoSaveTimer = setTimeout(async () => {
      // فقط اگر داده‌های اصلی پر شده باشند
      if (examProvider && examDate && !saving && !loading) {
        const token = typeof window !== "undefined" ? localStorage.getItem("access") : null
        if (!token) return

        setSaving(true)
        try {
          const formData = {
            examProvider,
            examDate,
            dailyHours,
            school,
            hasExistingSchoolPlan,
            week1,
            week2,
            classes,
            subjects,
            commitments,
            lightEnabled,
            lightDay,
            generals,
          }

          // اگر requestId وجود دارد، از آن استفاده می‌کنیم (update)
          // در غیر این صورت یک درخواست جدید می‌سازیم
          if (requestId) {
            // می‌توانیم یک endpoint برای update هم اضافه کنیم
            // فعلاً فقط create می‌کنیم
          } else {
            const result = await createPlannerRequest(formData, token)
            setRequestId(result.id)
          }
        } catch (error: any) {
          console.error("خطا در ذخیره خودکار:", error)
          // خطا را به صورت silent handle می‌کنیم
        } finally {
          setSaving(false)
        }
      }
    }, 2000) // بعد از 2 ثانیه عدم تغییر، ذخیره می‌شود

    return () => clearTimeout(autoSaveTimer)
  }, [examProvider, examDate, dailyHours, school, hasExistingSchoolPlan, week1, week2, classes, subjects, commitments, lightEnabled, lightDay, generals])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // اعتبارسنجی
    if (!examProvider || !examDate) {
      toast({
        title: "خطا",
        description: "لطفاً برند آزمون و تاریخ آزمون را انتخاب کنید.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("access") : null

    if (!token) {
      toast({
        title: "خطا",
        description: "لطفاً ابتدا وارد حساب کاربری خود شوید.",
        variant: "destructive",
      })
      setLoading(false)
      router.push("/login")
      return
    }

    try {
      // آماده‌سازی داده‌های فرم
      const formData = {
        examProvider,
        examDate,
        dailyHours,
        school,
        hasExistingSchoolPlan,
        week1,
        week2,
        classes,
        subjects,
        commitments,
        lightEnabled,
        lightDay,
        generals,
      }

      let currentRequestId = requestId

      // اگر درخواست draft وجود ندارد، یک درخواست جدید می‌سازیم
      if (!currentRequestId) {
        const created = await createPlannerRequest(formData, token)
        currentRequestId = created.id
        setRequestId(currentRequestId)
      }

      // ارسال درخواست برای پردازش (تغییر وضعیت از draft به pending)
      await submitPlannerRequest(currentRequestId, token)

      // دریافت داده‌های کامل برای ارسال به LLM
      const llmData = await getPlannerForLLM(currentRequestId, token)

      // در اینجا می‌توانید داده‌ها را به LLM service ارسال کنید
      // برای مثال:
      // await sendToLLMService(llmData)
      
      // یا می‌توانید event به Inngest بفرستید:
      // await triggerInngestEvent('planner/started', { request_id: currentRequestId })

      toast({
        title: "برنامه با موفقیت ثبت شد",
        description: "درخواست شما برای پردازش ارسال شد. در حال انتقال...",
      })

      // هدایت به صفحه نمایش برنامه یا داشبورد
      router.push(`/planner/board?request_id=${currentRequestId}`)
    } catch (error: any) {
      console.error("خطا در ساخت برنامه:", error)
      toast({
        title: "خطا",
        description: error?.message || "خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto" dir="rtl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">ساخت برنامه آزمونی شخصی‌سازی‌شده</h1>
          <p className="text-muted-foreground">ورودی‌های لازم برای تولید برنامهٔ دوهفته‌ای هوشمند</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />انتخاب آزمون</CardTitle>
              <CardDescription>ابتدا برند آزمون، سپس تاریخ آزمون را انتخاب کن</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>برند آزمون</Label>
                <Select value={examProvider} onValueChange={(v) => { setExamProvider(v); setExamDate("") }} required>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب برند" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ghalamchi">قلم‌چی</SelectItem>
                    <SelectItem value="gaj">گاج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تاریخ آزمون</Label>
                <Select value={examDate} onValueChange={setExamDate} required disabled={!examProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب تاریخ" />
                  </SelectTrigger>
                  <SelectContent>
                    {(examProvider ? examDateOptions[examProvider] : []).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ساعت مطالعه روزانه</Label>
                <div className="flex items-center gap-3">
                  <Input type="range" min={2} max={15} value={dailyHours} onChange={(e) => setDailyHours(Number(e.target.value))} />
                  <Input type="number" min={2} max={15} value={dailyHours} onChange={(e) => setDailyHours(Number(e.target.value))} className="w-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                برنامه مدرسه
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="toggle"
                  onClick={() => setSchoolCollapsed((v) => !v)}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${schoolCollapsed ? "" : "rotate-180"}`} />
                </Button>
              </CardTitle>
              <CardDescription>برای ثبت اولیه یا ویرایش هفته‌ها از کنترل‌ها استفاده کن</CardDescription>
              {!schoolCollapsed ? (
                <div data-slot="card-action" className="flex items-center gap-2">
                  <div className="w-56">
                    <Select value={schoolTarget} onValueChange={(v: any) => setSchoolTarget(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب بخش" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">ویرایش برنامه اصلی مدرسه</SelectItem>
                        <SelectItem value="week1" disabled={!hasExistingSchoolPlan}>هفتهٔ اول</SelectItem>
                        <SelectItem value="week2" disabled={!hasExistingSchoolPlan}>هفتهٔ دوم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!hasExistingSchoolPlan && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setHasExistingSchoolPlan(true)
                        setWeek1(school.map((r) => ({ ...r })))
                        setWeek2(school.map((r) => ({ ...r })))
                        setSchoolTarget("week1")
                        setSchoolCollapsed(false)
                      }}
                    >
                      فعال‌سازی هفته‌ها
                    </Button>
                  )}
                </div>
              ) : null}
            </CardHeader>

            {schoolCollapsed ? null : schoolTarget === "base" && (
              <CardContent className="space-y-3">
                {school.map((row, idx) => (
                  <div key={row.day} className="grid grid-cols-5 gap-3 items-center">
                    <Label className="col-span-1">{row.day}</Label>
                    <Button type="button" variant={row.has ? "secondary" : "outline"} onClick={() => {
                      const s = [...school]; s[idx] = { ...row, has: !row.has }; setSchool(s)
                    }}>{row.has ? "فعال" : "غیرفعال"}</Button>
                    <Input type="time" value={row.start} onChange={(e) => { const s = [...school]; s[idx] = { ...row, start: e.target.value }; setSchool(s) }} />
                    <Input type="time" value={row.end} onChange={(e) => { const s = [...school]; s[idx] = { ...row, end: e.target.value }; setSchool(s) }} />
                    <div className="text-xs text-muted-foreground">بازه حضور</div>
                  </div>
                ))}
                {!hasExistingSchoolPlan && (
                  <div className="text-xs text-muted-foreground">پس از ثبت اولیه می‌توانی هفتهٔ اول و دوم را جداگانه تنظیم کنی.</div>
                )}
              </CardContent>
            )}

            {!schoolCollapsed && schoolTarget === "week1" && (
              <CardContent className="space-y-3">
                {week1.map((row, idx) => (
                  <div key={row.day} className="grid grid-cols-5 gap-3 items-center">
                    <Label className="col-span-1">{row.day}</Label>
                    <Button type="button" variant={row.has ? "secondary" : "outline"} onClick={() => {
                      const s = [...week1]; s[idx] = { ...row, has: !row.has }; setWeek1(s)
                    }}>{row.has ? "فعال" : "غیرفعال"}</Button>
                    <Input type="time" value={row.start} onChange={(e) => { const s = [...week1]; s[idx] = { ...row, start: e.target.value }; setWeek1(s) }} />
                    <Input type="time" value={row.end} onChange={(e) => { const s = [...week1]; s[idx] = { ...row, end: e.target.value }; setWeek1(s) }} />
                    <div className="text-xs text-muted-foreground">بازه حضور</div>
                  </div>
                ))}
              </CardContent>
            )}

            {!schoolCollapsed && schoolTarget === "week2" && (
              <CardContent className="space-y-3">
                {week2.map((row, idx) => (
                  <div key={row.day} className="grid grid-cols-5 gap-3 items-center">
                    <Label className="col-span-1">{row.day}</Label>
                    <Button type="button" variant={row.has ? "secondary" : "outline"} onClick={() => {
                      const s = [...week2]; s[idx] = { ...row, has: !row.has }; setWeek2(s)
                    }}>{row.has ? "فعال" : "غیرفعال"}</Button>
                    <Input type="time" value={row.start} onChange={(e) => { const s = [...week2]; s[idx] = { ...row, start: e.target.value }; setWeek2(s) }} />
                    <Input type="time" value={row.end} onChange={(e) => { const s = [...week2]; s[idx] = { ...row, end: e.target.value }; setWeek2(s) }} />
                    <div className="text-xs text-muted-foreground">بازه حضور</div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>برنامه کلاس جانبی (اختیاری)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {classes.map((c, i) => (
                <div key={i} className="grid md:grid-cols-5 gap-3 items-center">
                  <Input placeholder="درس" value={c.lesson} onChange={(e) => { const x=[...classes]; x[i]={...c, lesson:e.target.value}; setClasses(x) }} />
                  <Select value={c.day} onValueChange={(v) => { const x=[...classes]; x[i]={...c, day:v}; setClasses(x) }}>
                    <SelectTrigger><SelectValue placeholder="روز" /></SelectTrigger>
                    <SelectContent>{days.map((d)=>(<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                  </Select>
                  <Input type="time" value={c.start} onChange={(e) => { const x=[...classes]; x[i]={...c, start:e.target.value}; setClasses(x) }} />
                  <Input type="time" value={c.end} onChange={(e) => { const x=[...classes]; x[i]={...c, end:e.target.value}; setClasses(x) }} />
                  <Button type="button" variant="destructive" onClick={() => { const x=[...classes]; x.splice(i,1); setClasses(x) }}>حذف</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setClasses([...classes, { lesson: "", day: "", start: "16:00", end: "18:00" }])}>افزودن کلاس</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>دروس هدف‌دار یا ضعیف</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {Object.keys(subjects).map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <Input type="checkbox" checked={subjects[s].checked} onChange={(e) => setSubjects({ ...subjects, [s]: { ...subjects[s], checked: e.target.checked } })} className="size-4" />
                  <Label className="min-w-16">{s}</Label>
                  <Select value={subjects[s].level} onValueChange={(v: any) => setSubjects({ ...subjects, [s]: { ...subjects[s], level: v } })}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="سطح" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weak">ضعیف</SelectItem>
                      <SelectItem value="mid">متوسط</SelectItem>
                      <SelectItem value="strong">مسلط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تعهدهای ثابت روزانه</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {commitments.map((c, i) => (
                <div key={i} className="grid md:grid-cols-4 gap-3 items-center">
                  <Input placeholder="فعالیت" value={c.text} onChange={(e) => { const x=[...commitments]; x[i]={...c, text:e.target.value}; setCommitments(x) }} />
                  <Input type="number" min={5} max={120} placeholder="دقیقه" value={c.minutes} onChange={(e) => { const x=[...commitments]; x[i]={...c, minutes:Number(e.target.value)}; setCommitments(x) }} />
                  <div className="text-xs text-muted-foreground">مثال: ۱۵ دقیقه لغت</div>
                  <Button type="button" variant="destructive" onClick={() => { const x=[...commitments]; x.splice(i,1); setCommitments(x) }}>حذف</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setCommitments([...commitments, { text: "", minutes: 15 }])}>افزودن فعالیت</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>روز ویژه سبک</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3 items-center">
              <Button type="button" variant={lightEnabled ? "secondary" : "outline"} onClick={() => setLightEnabled((v) => !v)}>{lightEnabled ? "فعال" : "غیرفعال"}</Button>
              <Select value={lightDay} onValueChange={setLightDay} disabled={!lightEnabled}>
                <SelectTrigger><SelectValue placeholder="انتخاب روز" /></SelectTrigger>
                <SelectContent>{days.map((d)=>(<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>دروس عمومی</CardTitle>
              <CardDescription>تعداد روز مطالعه در هفته و هدف نمره</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(generals).map((g) => (
                <div key={g} className="grid md:grid-cols-5 gap-3 items-center">
                  <Label className="col-span-1">{g}</Label>
                  <Input type="number" min={0} max={3} value={generals[g].days} onChange={(e) => setGenerals({ ...generals, [g]: { ...generals[g], days: Number(e.target.value) } })} />
                  <Input type="number" min={0} max={20} placeholder="هدف نمره" value={generals[g].target ?? ''} onChange={(e) => setGenerals({ ...generals, [g]: { ...generals[g], target: e.target.value ? Number(e.target.value) : undefined } })} />
                  <div className="text-xs text-muted-foreground">۰ تا ۳ روز</div>
                  <div className="text-xs text-muted-foreground">۰ تا ۲۰</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>انصراف</Button>
            <Button type="submit" disabled={loading}>{loading ? "در حال ساخت برنامه..." : "ساخت برنامه من"}{!loading && <ArrowLeft className="w-4 h-4 mr-2" />}</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
