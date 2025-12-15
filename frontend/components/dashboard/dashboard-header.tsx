import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, User } from "lucide-react"

export function DashboardHeader() {
  return (
    <Card className="bg-gradient-to-l from-primary/10 to-transparent border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">آماده برای مطالعه امروز هستید؟</h1>
            <p className="text-muted-foreground">۵ درس برای امروز در برنامه شما قرار دارد</p>
          </div>
          <div className="flex gap-3">
            <Link href="/planner/create">
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                ساخت برنامه جدید
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="secondary">
                <User className="w-4 h-4 ml-2" />
                پروفایل
              </Button>
            </Link>
            <Button variant="outline">
              <Edit className="w-4 h-4 ml-2" />
              ویرایش برنامه
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
