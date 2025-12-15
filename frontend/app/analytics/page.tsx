import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">تحلیل و گزارش‌ها</h1>
          <p className="text-muted-foreground">نمای کامل از پیشرفت و عملکرد شما</p>
        </div>

        <AnalyticsCharts />
      </div>
    </DashboardLayout>
  )
}
