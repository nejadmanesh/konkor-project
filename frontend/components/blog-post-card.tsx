import { Post } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Calendar, ArrowLeft, User } from 'lucide-react'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BlogPostCardProps {
  post: Post
}

function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'تاریخ نامشخص'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'تاریخ نامشخص'
    return format(date, 'dd MMM yyyy', { locale: faIR })
  } catch {
    return 'تاریخ نامشخص'
  }
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border-border/50 hover:border-primary/30">
      {post.featured_image && (
        <Link href={`/blog/${post.slug}`}>
          <div className="relative h-[13.5rem] w-full overflow-hidden bg-muted">
            <Image
              src={post.featured_image || '/placeholder.svg'}
              alt={post.featured_image_alt || post.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
      )}

      <CardHeader className="pb-3">
        {post.category && post.category.name && (
          <Link
            href={`/blog?category=${post.category.slug || 'uncategorized'}`}
            className="inline-block w-fit mb-3"
          >
            <Badge
              variant="secondary"
              className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all"
            >
              {post.category.name}
            </Badge>
          </Link>
        )}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2 text-balance group-hover:translate-x-1 duration-300">
            {post.title || 'بدون عنوان'}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
          {post.excerpt || post.title || 'بدون خلاصه'}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 text-xs text-muted-foreground border-t border-border/50 pt-4 mt-auto">
        {/* Author */}
        {post.author && post.author.display_name && (
          <div className="flex items-center gap-3 w-full">
            {post.author.profile_image ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border/50 flex-shrink-0">
                <Image
                  src={post.author.profile_image}
                  alt={post.author.display_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="text-xs font-medium text-foreground truncate">{post.author.display_name}</span>
          </div>
        )}
        
        {/* Metadata Row */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {post.published_at && (
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.reading_time || 0} دقیقه</span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-primary hover:gap-2 transition-all group/link"
          >
            <span className="text-xs font-medium">ادامه</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover/link:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
