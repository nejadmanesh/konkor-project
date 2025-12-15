'use client'

import { useEffect, useState, useRef } from 'react'
import { List, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

// تابع برای ساخت id از متن (پشتیبانی از فارسی)
function generateId(text: string, index: number): string {
  if (!text) return `heading-${index}`
  
  // اگر heading قبلاً id داشته باشد، از همان استفاده می‌کنیم
  // در غیر این صورت، یک id ساده می‌سازیم
  const cleanText = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  return cleanText || `heading-${index}`
}

// تابع برای استخراج headings از HTML
function extractHeadings(html: string): TocItem[] {
  if (!html) return []

  // استفاده از DOMParser برای parse کردن HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // پیدا کردن تمام h2, h3, h4
  const headings = doc.querySelectorAll('h2, h3, h4')
  const items: TocItem[] = []

  headings.forEach((heading, index) => {
    const text = heading.textContent?.trim() || ''
    if (!text) return

    // استفاده از id موجود یا ساخت id جدید
    const id = heading.id || generateId(text, index)
    const level = parseInt(heading.tagName.charAt(1)) // h2 = 2, h3 = 3, etc.

    items.push({ id, text, level })
  })

  return items
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // استخراج headings از محتوا
    const tocItems = extractHeadings(content)
    
    // اضافه کردن id به headings در DOM اگر وجود نداشته باشد
    const ensureHeadingIds = () => {
      tocItems.forEach((item) => {
        // پیدا کردن heading در DOM بر اساس متن
        const headings = document.querySelectorAll('h2, h3, h4')
        headings.forEach((heading) => {
          const headingText = heading.textContent?.trim()
          if (headingText === item.text && !heading.id) {
            heading.id = item.id
          }
        })
      })
    }

    // صبر کردن تا DOM render شود
    const timeoutId = setTimeout(() => {
      ensureHeadingIds()
      setHeadings(tocItems)
    }, 100)

    // اگر heading وجود نداشت، observer را تنظیم نکن
    if (tocItems.length === 0) {
      return () => clearTimeout(timeoutId)
    }

    // تنظیم Intersection Observer برای highlight کردن بخش فعال
    const setupObserver = () => {
      const observerOptions = {
        rootMargin: '-20% 0px -70% 0px', // وقتی heading به 20% بالای viewport برسد، active می‌شود
        threshold: 0,
      }

      observerRef.current = new IntersectionObserver((entries) => {
        // پیدا کردن اولین heading که در viewport است
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      }, observerOptions)

      // مشاهده کردن تمام headings
      tocItems.forEach((item) => {
        const element = document.getElementById(item.id)
        if (element && observerRef.current) {
          observerRef.current.observe(element)
        }
      })
    }

    // صبر کردن تا DOM render شود و سپس observer را تنظیم کنیم
    const observerTimeoutId = setTimeout(setupObserver, 200)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      clearTimeout(observerTimeoutId)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [content])

  // اگر heading وجود نداشت، چیزی نمایش نده
  if (headings.length === 0) return null

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 125 // فاصله از بالای صفحه
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className={cn('rounded-xl border border-border/50 bg-card p-8 space-y-5', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden w-full flex items-center justify-between text-foreground font-semibold hover:text-primary transition-colors"
      >
        <div className="flex items-center gap-3">
          <List className="w-5 h-5 text-primary" />
          فهرست مطالب
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
      
      <h3 className="hidden lg:flex items-center gap-3 font-semibold text-foreground">
        <List className="w-5 h-5 text-primary" />
        فهرست مطالب
      </h3>
      
      <nav 
        className={cn(
          'space-y-3 transition-all duration-200',
          'lg:block',
          isExpanded ? 'block' : 'hidden'
        )} 
        aria-label="فهرست مطالب"
      >
        <ul className="space-y-2 text-base">
          {headings.map((item) => {
            const isActive = activeId === item.id
            const indent = item.level === 3 ? 'pr-5' : item.level === 4 ? 'pr-10' : 'pr-0'

            return (
              <li key={item.id} className={indent}>
                <button
                  onClick={() => {
                    scrollToHeading(item.id)
                    // در موبایل بعد از کلیک، TOC را ببند
                    if (window.innerWidth < 1024) {
                      setIsExpanded(false)
                    }
                  }}
                  className={cn(
                    'w-full text-right transition-all duration-200 hover:text-primary',
                    isActive
                      ? 'text-primary font-medium border-r-2 border-primary pr-4'
                      : 'text-muted-foreground hover:pr-3'
                  )}
                >
                  {item.text}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

