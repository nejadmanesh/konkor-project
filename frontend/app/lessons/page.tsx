import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LessonsList } from "@/components/lessons/lessons-list"

export default function LessonsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">دروس</h1>
          <p className="text-muted-foreground">مشاهده پیشرفت و جزئیات هر درس</p>
        </div>

        <LessonsList />
      </div>
    </DashboardLayout>
  )
}
