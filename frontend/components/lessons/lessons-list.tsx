import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronLeft } from "lucide-react"

const lessons = [
  { id: 1, name: "ریاضی", progress: 75, chapters: 12, completed: 9 },
  { id: 2, name: "فیزیک", progress: 60, chapters: 10, completed: 6 },
  { id: 3, name: "شیمی", progress: 45, chapters: 11, completed: 5 },
  { id: 4, name: "زیست‌شناسی", progress: 80, chapters: 15, completed: 12 },
  { id: 5, name: "ادبیات فارسی", progress: 90, chapters: 8, completed: 7 },
  { id: 6, name: "عربی", progress: 55, chapters: 9, completed: 5 },
  { id: 7, name: "دین و زندگی", progress: 100, chapters: 6, completed: 6 },
  { id: 8, name: "زبان انگلیسی", progress: 70, chapters: 10, completed: 7 },
]

export function LessonsList() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {lessons.map((lesson) => (
        <Card key={lesson.id} className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{lesson.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {lesson.completed} از {lesson.chapters} فصل
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-primary">{lesson.progress}%</p>
                <p className="text-xs text-muted-foreground">پیشرفت</p>
              </div>
            </div>

            <Progress value={lesson.progress} className="mb-4" />

            <Button variant="outline" className="w-full bg-transparent">
              نمایش جزئیات
              <ChevronLeft className="w-4 h-4 mr-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
