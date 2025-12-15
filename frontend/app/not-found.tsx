import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-primary mb-4">404</div>
          <CardTitle className="text-2xl">مقاله یافت نشد</CardTitle>
          <CardDescription className="mt-2">
            متأسفانه مقاله مورد نظر شما پیدا نشد. ممکن است حذف شده باشد یا آدرس اشتباه باشد.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/blog">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 ml-2" />
                بازگشت به وبلاگ
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Home className="w-4 h-4 ml-2" />
                صفحه اصلی
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

