'use client'

import { useState } from 'react'
import { submitComment } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { MessageSquare, Star, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CommentSectionProps {
  postSlug: string
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !content) {
      toast({ title: 'خطا', description: 'لطفا تمام فیلدها را پر کنید', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      await submitComment(postSlug, { name, email, content, rating: rating > 0 ? rating : undefined })
      toast({ title: 'موفق', description: 'نظر شما ثبت شد و پس از تایید نمایش داده می‌شود.' })
      setName('')
      setEmail('')
      setContent('')
      setRating(0)
    } catch {
      toast({ title: 'خطا', description: 'مشکلی در ثبت نظر پیش آمد. لطفا دوباره تلاش کنید.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <span>نظر شما</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground block">
                نام
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام خود را وارد کنید"
                required
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground block">
                ایمیل
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل خود را وارد کنید"
                required
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium text-foreground block">
              نظر شما
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="نظر خود را بنویسید..."
              rows={6}
              required
              className="transition-all focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">امتیاز (اختیاری)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 fill-gray-200 dark:fill-gray-800 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-muted-foreground mr-2">({rating} از 5)</span>
              )}
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto min-w-[140px] group"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                در حال ارسال...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                ارسال نظر
              </>
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" />
          نظرات پس از تایید مدیر نمایش داده می‌شوند.
        </p>
      </CardContent>
    </Card>
  )
}
