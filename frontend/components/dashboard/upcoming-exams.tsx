import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertCircle } from "lucide-react"

const exams = [
  { id: 1, name: "آزمون جامع ۱", date: "۱۵ اسفند", daysLeft: 5, urgent: true },
  { id: 2, name: "آزمون ریاضی", date: "۲۲ اسفند", daysLeft: 12, urgent: false },
  { id: 3, name: "آزمون تجربی کنکور", date: "۵ فروردین", daysLeft: 20, urgent: false },
]

export function UpcomingExams() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>آزمون‌های پیش رو</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${exam.urgent ? "bg-destructive/10" : "bg-primary/10"}`}>
                  {exam.urgent ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Calendar className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium mb-1">{exam.name}</p>
                  <p className="text-sm text-muted-foreground">{exam.date}</p>
                </div>
              </div>
              <Badge variant={exam.urgent ? "destructive" : "secondary"}>{exam.daysLeft} روز</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
