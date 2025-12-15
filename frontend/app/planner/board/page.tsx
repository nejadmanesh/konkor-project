"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KanbanBoard } from "@/components/planner/kanban-board"

export default function BoardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">برنامه مطالعه</h1>
          <p className="text-muted-foreground">درس‌های خود را بین لیست‌ها جابجا کنید</p>
        </div>

        <KanbanBoard />
      </div>
    </DashboardLayout>
  )
}
