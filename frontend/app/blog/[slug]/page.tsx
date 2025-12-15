// app/blog/[slug]/page.tsx

import { getPost, getRecentPosts, getBlogNavigation } from '@/lib/api'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { Clock, Calendar, Eye, BookOpen, Sparkles, ArrowRight, User, Award } from 'lucide-react'
import { ReadingProgress } from '@/components/blog/reading-progress'
import { ShareButtons } from '@/components/blog/share-buttons'
import { AuthorCard } from '@/components/blog/author-card'
import { RelatedArticles } from '@/components/blog/related-articles'
import { TableOfContents } from '@/components/blog/table-of-contents'
import TableOfContentsNew from '@/components/blog/TableOfContents'
import { BlogHeader } from '@/components/blog/blog-header'
import { CategoryFilterBar } from '@/components/blog/category-filter-bar'
import { Breadcrumbs } from '@/components/blog/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { convertContentToHtml, extractTOCFromHtml } from '@/lib/markdown'
import { generateSeoMetadata, generateArticleStructuredData } from '@/lib/seo'

function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'تاریخ نامشخص'
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? 'تاریخ نامشخص' : format(date, 'dd MMMM yyyy', { locale: faIR })
  } catch {
    return 'تاریخ نامشخص'
  }
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params
  return await generateSeoMetadata('posts', resolvedParams.slug)
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params
  const { isEnabled: isDraftMode } = await draftMode()
  let post
  try {
    post = await getPost(resolvedParams.slug, isDraftMode)
  } catch {
    notFound()
  }

  let recentPosts: any[] = []
  let navigation: any = null
  try {
    recentPosts = await getRecentPosts()
    navigation = await getBlogNavigation().catch(() => ({
      mainMenuItems: [],
      filterMenuItems: [],
    }))
  } catch {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const structuredData = generateArticleStructuredData(post, siteUrl)
  
  // استخراج TOC از محتوا
  const htmlContent = post.content ? convertContentToHtml(post.content) : ''
  const toc = extractTOCFromHtml(htmlContent)

  return (
    <>
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}

      {navigation && <BlogHeader navigation={navigation} />}
      {navigation && <CategoryFilterBar navigation={navigation} />}
      <Breadcrumbs category={post.category} postTitle={post.title} />

      <ReadingProgress />

      {isDraftMode && (
        <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center font-semibold">
          🔒 این مقاله هنوز منتشر نشده است
        </div>
      )}

      <main className="min-h-screen bg-background">
        {/* --- HERO --- */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="relative container mx-auto px-5 py-[3.375rem] md:py-[4.5rem] max-w-[753px]">

            {/* Category */}
            <div className="mb-7">
              <Link href={`/blog?category=${post.category.slug}`} className="inline-flex items-center gap-3 group">
                <Badge
                  variant="secondary"
                  className="px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all group-hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 ml-1" />
                  {post.category.name}
                </Badge>
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-7 leading-tight text-balance">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-xl md:text-2xl text-muted-foreground mb-9 leading-relaxed">
                {post.subtitle}
              </p>
            )}

            {/* META */}
            <div className="flex flex-wrap items-center gap-7 text-sm text-muted-foreground mb-9 pb-9 border-b border-border/50">
              {post.published_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary" />
                <span>{post.reading_time} دقیقه مطالعه</span>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-primary" />
                <span>{post.view_count.toLocaleString('fa-IR')} بازدید</span>
              </div>
            </div>
          </div>
        </section>

        {/* IMAGE */}
        {post.featured_image && (
          <div className="relative w-full flex justify-center items-center py-8 md:py-12">
            <div className="relative w-full max-w-[1300px] h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 dark:shadow-primary/10 ring-1 ring-border/50 dark:ring-border/30 group mx-auto">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10" />
              
              {/* Image */}
              <Image 
                src={post.featured_image} 
                alt="" 
                width={1300}
                height={500}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" 
                priority 
                aria-hidden="true"
              />
              
              {/* Bottom Shadow Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 via-background/40 to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* ARTICLE CONTENT */}
        <article className="container mx-auto px-5 py-[3.375rem] md:py-[4.5rem]">
          <div className="max-w-[1083px] mx-auto grid grid-cols-1 lg:grid-cols-[753px_280px] gap-[3.375rem]">

            {/* ستون اصلی مقاله */}
            <div className="space-y-9">
              <ShareButtons title={post.title} url={`/blog/${post.slug}`} />

              {/* Table of Contents - Mobile Version */}
              {post.content && (
                <div className="lg:hidden">
                  <TableOfContents content={htmlContent} />
                </div>
              )}

              {/* ⭐⭐ این بخش مهم نهایی است ⭐⭐ */}
              {post.content ? (
                <div
                  className="prose prose-2xl rtl:text-right dark:prose-invert prose-rich-text max-w-[753px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : (
                <div className="p-9 bg-muted/50 rounded-xl border border-border/50">
                  <p className="text-muted-foreground text-center">محتوای این مقاله در دسترس نیست.</p>
                </div>
              )}

              <ShareButtons title={post.title} url={`/blog/${post.slug}`} />
              <AuthorCard author={post.author} />
            </div>

            {/* Sidebar - TOC و Reading Stats */}
            <aside className="hidden lg:block space-y-7">
              <div className="sticky top-[6.75rem] space-y-7">
                {/* TOC جدید - فقط وقتی وجود دارد */}
                {toc.length > 0 && (
                  <TableOfContentsNew toc={toc} />
                )}
                
                {/* Reading Stats */}
                <div className="rounded-xl border border-border/50 bg-card p-7 space-y-4">
                  <h3 className="text-foreground flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-primary" /> آمار خواندن
                  </h3>
                  <div className="text-sm space-y-3">
                    <div className="flex justify-between">
                      <span>زمان مطالعه</span>
                      <span className="font-medium">{post.reading_time} دقیقه</span>
                    </div>
                    <div className="flex justify-between">
                      <span>تعداد بازدید</span>
                      <span className="font-medium">{post.view_count.toLocaleString('fa-IR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {post.related_posts && post.related_posts.length > 0 && (
          <RelatedArticles
            posts={post.related_posts}
            title="مقالات مرتبط"
          />
        )}

{/* Recent Posts */}
{recentPosts?.length > 0 && (
  <RelatedArticles
    posts={recentPosts.slice(0, 3)}
    title="آخرین مقالات"
  />
)}

</main>
</>
)
}
