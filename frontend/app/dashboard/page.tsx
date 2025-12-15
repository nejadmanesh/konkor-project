"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DailyPlan } from "@/components/dashboard/daily-plan"
import { WeeklyOverview } from "@/components/dashboard/weekly-overview"
import { ProgressChart } from "@/components/dashboard/progress-chart"
import { UpcomingExams } from "@/components/dashboard/upcoming-exams"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useStudentStore } from "@/lib/store"

export default function DashboardPage() {
  const { profileCompleted } = useStudentStore()
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader />
        {!profileCompleted && (
          <div className="p-4 border border-border rounded-lg bg-muted">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">پروفایل شما کامل نیست</h3>
                <p className="text-sm text-muted-foreground">برای ادامه بهتر تجربه، لطفاً پروفایل را تکمیل کنید.</p>
              </div>
              <Link href="/profile">
                <Button>تکمیل پروفایل</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <DailyPlan />
          <UpcomingExams />
        </div>

        <WeeklyOverview />

        <ProgressChart />
      </div>
    </DashboardLayout>
  )
}
