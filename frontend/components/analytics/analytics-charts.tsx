"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const weeklyStudyData = [
  { day: "شنبه", hours: 6 },
  { day: "یکشنبه", hours: 7 },
  { day: "دوشنبه", hours: 5 },
  { day: "سه‌شنبه", hours: 8 },
  { day: "چهارشنبه", hours: 6 },
  { day: "پنجشنبه", hours: 4 },
  { day: "جمعه", hours: 3 },
]

const subjectProgressData = [
  { subject: "ریاضی", progress: 75 },
  { subject: "فیزیک", progress: 60 },
  { subject: "شیمی", progress: 45 },
  { subject: "زیست", progress: 80 },
  { subject: "ادبیات", progress: 90 },
  { subject: "عربی", progress: 55 },
]

const timeDistributionData = [
  { name: "ریاضی", value: 25, color: "hsl(var(--chart-1))" },
  { name: "فیزیک", value: 20, color: "hsl(var(--chart-2))" },
  { name: "شیمی", value: 15, color: "hsl(var(--chart-3))" },
  { name: "زیست", value: 18, color: "hsl(var(--chart-4))" },
  { name: "سایر", value: 22, color: "hsl(var(--chart-5))" },
]

const performanceTrendData = [
  { month: "مهر", score: 65 },
  { month: "آبان", score: 70 },
  { month: "آذر", score: 68 },
  { month: "دی", score: 75 },
  { month: "بهمن", score: 78 },
  { month: "اسفند", score: 82 },
]

export function AnalyticsCharts() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">مجموع ساعت مطالعه</p>
            <p className="text-3xl font-bold text-primary">۲۴۵</p>
            <p className="text-xs text-muted-foreground mt-1">این ماه</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">میانگین روزانه</p>
            <p className="text-3xl font-bold text-accent">۶.۵</p>
            <p className="text-xs text-muted-foreground mt-1">ساعت</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">دروس تکمیل شده</p>
            <p className="text-3xl font-bold">۳</p>
            <p className="text-xs text-muted-foreground mt-1">از ۸ درس</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">رتبه تقریبی</p>
            <p className="text-3xl font-bold text-chart-4">۱۲۰۰</p>
            <p className="text-xs text-muted-foreground mt-1">منطقه ۲</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>مطالعه هفتگی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStudyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" reversed />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="ساعت" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>پیشرفت هر درس</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="subject" type="category" className="text-xs" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="progress" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} name="درصد پیشرفت" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزیع زمان مطالعه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>روند عملکرد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" reversed />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={3}
                    name="امتیاز"
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Card */}
      <Card>
        <CardHeader>
          <CardTitle>مقایسه با میانگین</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { metric: "ساعت مطالعه روزانه", you: 6.5, average: 5.2 },
              { metric: "تعداد آزمون", you: 12, average: 10 },
              { metric: "درصد پیشرفت کلی", you: 72, average: 65 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="font-medium">{item.metric}</span>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground ml-2">شما:</span>
                    <span className="font-bold text-primary">{item.you}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground ml-2">میانگین:</span>
                    <span className="font-medium">{item.average}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
