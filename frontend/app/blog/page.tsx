// app/blog/page.tsx

import { getPosts, getCategories, getBlogNavigation } from '@/lib/api'
import { BlogPostCard } from '@/components/blog-post-card'
import { BlogFilters } from '@/components/blog-filters'
import { BlogHeader } from '@/components/blog/blog-header'
import { CategoryFilterBar } from '@/components/blog/category-filter-bar'
import { Breadcrumbs } from '@/components/blog/breadcrumbs'
import { Suspense } from 'react'
import { convertContentToHtml } from '@/lib/markdown'  // ← مهم: استفاده از نسخه جدید

export const metadata = {
  title: 'وبلاگ - مشاور کنکور',
  description: 'مقالات تخصصی در زمینه برنامه‌ریزی کنکور، روش‌های مطالعه و راهنمایی تحصیلی',
}

interface BlogPageProps {
  searchParams?: Promise<{
    page?: string | string[]
    search?: string | string[]
    category?: string | string[]
    grade?: string | string[]
    field?: string | string[]
    ordering?: string | string[]
    tag?: string | string[]
  }>
}

// استخراج مقدار واقعی پارامترها
function getStringValue(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.length > 0) return value[0]
  return undefined
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const pageParam = getStringValue(resolvedSearchParams.page)
  const parsedPage = pageParam ? parseInt(pageParam, 10) : 1
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  let posts: any[] = []
  let count = 0
  let categories: any[] = []
  let navigation: any = null

  // گرفتن داده‌ها از API
  try {
    const postsData = await getPosts({
      page,
      search: getStringValue(resolvedSearchParams.search),
      category: getStringValue(resolvedSearchParams.category),
      grade: getStringValue(resolvedSearchParams.grade),
      field: getStringValue(resolvedSearchParams.field),
      tag: getStringValue(resolvedSearchParams.tag),
      ordering: getStringValue(resolvedSearchParams.ordering) || '-published_at',
    })
    posts = postsData.results
    count = postsData.count
    categories = await getCategories()
    navigation = await getBlogNavigation().catch(() => ({
      mainMenuItems: [],
      filterMenuItems: [],
    }))
  } catch (error: any) {
    throw error // برای Error Boundary
  }

  const totalPages = Math.ceil(count / 12)

  const currentFilters = {
    search: getStringValue(resolvedSearchParams.search),
    category: getStringValue(resolvedSearchParams.category),
    grade: getStringValue(resolvedSearchParams.grade),
    field: getStringValue(resolvedSearchParams.field),
    tag: getStringValue(resolvedSearchParams.tag),
    ordering: getStringValue(resolvedSearchParams.ordering) || '-published_at',
  }

  const currentCategory = categories.find(
    (cat) => cat.slug === getStringValue(resolvedSearchParams.category)
  )

  return (
    <main className="min-h-screen bg-background">
      {navigation && <BlogHeader navigation={navigation} />}
      {navigation && <CategoryFilterBar navigation={navigation} />}
      <Breadcrumbs category={currentCategory} />
      <div className="container mx-auto px-5 py-[3.375rem]">
        
        {/* عنوان صفحه / SEO */}
        <div className="mb-[3.375rem] text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            وبلاگ مشاور کنکور
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            راهنماهای جامع برای برنامه‌ریزی کنکور، روش‌های مطالعه موثر و نکات کلیدی برای موفقیت در امتحانات
          </p>
        </div>

        {/* فیلترها */}
        <Suspense fallback={<div>در حال بارگذاری فیلترها...</div>}>
          <BlogFilters categories={categories} currentFilters={currentFilters} />
        </Suspense>

        {/* محتوا */}
        <div className="mt-11">
          <p className="text-sm text-muted-foreground mb-7">
            {count} مقاله یافت شد
          </p>

          {posts.length === 0 ? (
            <div className="text-center py-[3.375rem]">
              <p className="text-muted-foreground">مقاله‌ای یافت نشد.</p>
            </div>
          ) : (
            <>
              {/* کارت مقالات */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>

              {/* صفحه‌بندی */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-[3.375rem]">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const params = new URLSearchParams()
                    params.set('page', String(pageNum))
                    if (currentFilters.search) params.set('search', currentFilters.search)
                    if (currentFilters.category) params.set('category', currentFilters.category)
                    if (currentFilters.grade) params.set('grade', currentFilters.grade)
                    if (currentFilters.field) params.set('field', currentFilters.field)
                    if (currentFilters.tag) params.set('tag', currentFilters.tag)
                    if (currentFilters.ordering && currentFilters.ordering !== '-published_at')
                      params.set('ordering', currentFilters.ordering)

                    return (
                      <a
                        key={pageNum}
                        href={`/blog?${params.toString()}`}
                        className={`px-4 py-2 rounded-md transition-colors
                          ${pageNum === page ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}
                        `}
                      >
                        {pageNum}
                      </a>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
