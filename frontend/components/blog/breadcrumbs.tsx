'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Category } from '@/lib/api'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  category?: Category
  postTitle?: string
}

export function Breadcrumbs({ category, postTitle }: BreadcrumbsProps) {
  const pathname = usePathname()

  const items = [
    { label: 'خانه', href: '/' },
  ]

  // Add blog if we're on a blog page
  if (pathname.startsWith('/blog')) {
    items.push({ label: 'بلاگ', href: '/blog' })
  }

  // Add category if available
  if (category) {
    items.push({
      label: category.name,
      href: `/blog?category=${category.slug}`,
    })
  }

  // Add post title if available
  if (postTitle) {
    items.push({ label: postTitle, href: pathname })
  }

  // Don't show breadcrumbs if only home
  if (items.length <= 1) {
    return null
  }

  return (
    <nav
      className="container mx-auto px-4 py-3 border-b border-border bg-background/50"
      aria-label="مسیر ناوبری"
    >
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronLeft className="w-4 h-4 text-muted-foreground/50" />
              )}
              {isLast ? (
                <span
                  className={cn(
                    'text-foreground font-medium',
                    postTitle && 'truncate max-w-xs'
                  )}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}


















