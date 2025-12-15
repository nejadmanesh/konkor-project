import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const weeklyData = [
  { day: "شنبه", hours: 6, target: 8 },
  { day: "یکشنبه", hours: 7, target: 8 },
  { day: "دوشنبه", hours: 5, target: 8 },
  { day: "سه‌شنبه", hours: 8, target: 8 },
  { day: "چهارشنبه", hours: 6, target: 8 },
  { day: "پنجشنبه", hours: 4, target: 8 },
  { day: "جمعه", hours: 0, target: 6 },
]

export function WeeklyOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>نمای هفتگی</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weeklyData.map((day) => (
            <div key={day.day} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{day.day}</span>
                <span className="text-muted-foreground">
                  {day.hours} از {day.target} ساعت
                </span>
              </div>
              <Progress value={(day.hours / day.target) * 100} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
