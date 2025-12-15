import { NextResponse } from "next/server"

export async function GET() {
  const dailyLessons = [
    { id: 1, subject: "ریاضی", topic: "مشتق", time: "۸:۰۰ - ۱۰:۰۰", completed: true },
    { id: 2, subject: "فیزیک", topic: "دینامیک", time: "۱۰:۳۰ - ۱۲:۰۰", completed: true },
    { id: 3, subject: "شیمی", topic: "ترمودینامیک", time: "۱۴:۰۰ - ۱۶:۰۰", completed: false },
    { id: 4, subject: "زیست", topic: "ژنتیک", time: "۱۶:۳۰ - ۱۸:۰۰", completed: false },
    { id: 5, subject: "ادبیات", topic: "آرایه‌های ادبی", time: "۱۹:۰۰ - ۲۰:۰۰", completed: false },
  ]

  return NextResponse.json({ lessons: dailyLessons })
}
