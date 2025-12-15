// lib/markdown.ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSanitize from 'rehype-sanitize'

function isHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content)
}

export function convertContentToHtml(content: string): string {
  if (!content) return ''

  const cleanContent = content.replace(/[\u200B-\u200D\uFEFF]/g, '')

  if (isHtml(cleanContent)) {
    return cleanContent
  }

  const result = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { className: ['heading-link'] },
    })
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .processSync(cleanContent)

  return result.toString()
}

// تابع برای ساخت id از متن (پشتیبانی از فارسی)
function generateIdFromText(text: string, index: number): string {
  if (!text) return `heading-${index}`
  
  const cleanText = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  return cleanText || `heading-${index}`
}

// تابع برای استخراج TOC از HTML (Server-Side Compatible)
export interface TOCItem {
  id: string
  text: string
}

export function extractTOCFromHtml(html: string): TOCItem[] {
  if (!html) return []

  const items: TOCItem[] = []
  
  // استفاده از regex برای پیدا کردن تمام h2 ها
  // این regex تمام h2 ها را با id و بدون id پیدا می‌کند
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi
  
  let match
  let index = 0
  
  while ((match = h2Regex.exec(html)) !== null) {
    const fullMatch = match[0] // کل تگ h2
    const htmlContent = match[1] || '' // محتوای داخل h2
    
    // استخراج id از تگ h2 (اگر وجود داشته باشد)
    const idMatch = fullMatch.match(/\s+id=["']([^"']+)["']/i)
    const id = idMatch ? idMatch[1] : null
    
    // استخراج متن از HTML (حذف تگ‌های HTML)
    const text = htmlContent
      .replace(/<[^>]+>/g, '') // حذف تمام تگ‌های HTML
      .replace(/&nbsp;/g, ' ') // تبدیل &nbsp; به فاصله
      .replace(/&amp;/g, '&') // تبدیل &amp; به &
      .replace(/&lt;/g, '<') // تبدیل &lt; به <
      .replace(/&gt;/g, '>') // تبدیل &gt; به >
      .replace(/&quot;/g, '"') // تبدیل &quot; به "
      .replace(/&#39;/g, "'") // تبدیل &#39; به '
      .replace(/&#x27;/g, "'") // تبدیل &#x27; به '
      .replace(/&#x2F;/g, '/') // تبدیل &#x2F; به /
      .trim()
    
    if (!text) continue
    
    // استفاده از id موجود یا ساخت id جدید
    const finalId = id || generateIdFromText(text, index)
    
    items.push({ id: finalId, text })
    index++
  }

  return items
}