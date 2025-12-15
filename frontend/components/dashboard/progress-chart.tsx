"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { week: "هفته ۱", hours: 35, target: 40 },
  { week: "هفته ۲", hours: 42, target: 40 },
  { week: "هفته ۳", hours: 38, target: 40 },
  { week: "هفته ۴", hours: 45, target: 40 },
  { week: "هفته ۵", hours: 40, target: 40 },
  { week: "هفته ۶", hours: 48, target: 40 },
]

export function ProgressChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>پیشرفت هفتگی (ساعت مطالعه)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" reversed />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} name="ساعت مطالعه" />
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="هدف"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
