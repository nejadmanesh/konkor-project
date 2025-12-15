import { NextResponse } from "next/server"

export async function GET() {
  const student = {
    id: 1,
    name: "سارا احمدی",
    email: "sara@example.com",
    grade: "12",
    field: "تجربی",
    examDate: "1403-03-25",
    dailyHours: 8,
    totalStudyHours: 245,
    lessonsCompleted: 3,
    totalLessons: 8,
  }

  return NextResponse.json(student)
}
