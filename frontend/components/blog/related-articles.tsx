import { Post } from '@/lib/api'
import { BlogPostCard } from '@/components/blog-post-card'
import { Sparkles } from 'lucide-react'

interface RelatedArticlesProps {
  posts: Post[]
  title?: string
}

export function RelatedArticles({ posts, title = 'مقالات مرتبط' }: RelatedArticlesProps) {
  if (posts.length === 0) return null

  return (
    <section className="relative py-[3.75rem] md:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="relative container mx-auto px-5">
        <div className="flex items-center gap-4 mb-10">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">{title}</h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
              <BlogPostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

