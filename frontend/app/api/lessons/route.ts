import { NextResponse } from "next/server"

export async function GET() {
  const lessons = [
    { id: 1, name: "ریاضی", progress: 75, chapters: 12, completed: 9 },
    { id: 2, name: "فیزیک", progress: 60, chapters: 10, completed: 6 },
    { id: 3, name: "شیمی", progress: 45, chapters: 11, completed: 5 },
    { id: 4, name: "زیست‌شناسی", progress: 80, chapters: 15, completed: 12 },
    { id: 5, name: "ادبیات فارسی", progress: 90, chapters: 8, completed: 7 },
    { id: 6, name: "عربی", progress: 55, chapters: 9, completed: 5 },
    { id: 7, name: "دین و زندگی", progress: 100, chapters: 6, completed: 6 },
    { id: 8, name: "زبان انگلیسی", progress: 70, chapters: 10, completed: 7 },
  ]

  return NextResponse.json({ lessons })
}
