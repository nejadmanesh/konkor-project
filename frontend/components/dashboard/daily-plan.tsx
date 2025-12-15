import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

const dailyLessons = [
  { id: 1, subject: "ریاضی", topic: "مشتق", time: "۸:۰۰ - ۱۰:۰۰", completed: true },
  { id: 2, subject: "فیزیک", topic: "دینامیک", time: "۱۰:۳۰ - ۱۲:۰۰", completed: true },
  { id: 3, subject: "شیمی", topic: "ترمودینامیک", time: "۱۴:۰۰ - ۱۶:۰۰", completed: false },
  { id: 4, subject: "زیست", topic: "ژنتیک", time: "۱۶:۳۰ - ۱۸:۰۰", completed: false },
  { id: 5, subject: "ادبیات", topic: "آرایه‌های ادبی", time: "۱۹:۰۰ - ۲۰:۰۰", completed: false },
]

export function DailyPlan() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>برنامه امروز</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dailyLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Checkbox checked={lesson.completed} className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-medium ${lesson.completed ? "line-through text-muted-foreground" : ""}`}>
                    {lesson.subject}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {lesson.topic}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{lesson.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
