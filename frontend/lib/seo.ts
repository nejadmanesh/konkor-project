// lib/seo.ts

import { draftMode } from 'next/headers'
import { getPost } from '@/lib/api'
import { Metadata } from 'next'

export async function generateSeoMetadata(
  contentType: string,    // مثل 'posts'
  slug: string
): Promise<Metadata> {
  try {
    const { isEnabled: isDraftMode } = await draftMode()
    
    // استفاده از تابع getPost موجود که داده‌های کامل را برمی‌گرداند
    const post = await getPost(slug, isDraftMode)

    if (!post) {
      return { 
        title: 'مقاله یافت نشد',
        description: 'مقاله مورد نظر یافت نشد'
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000'
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'

    // استفاده از فیلدهای SEO موجود در Post
    const title = post.meta_title || post.title
    const description = post.meta_description || post.excerpt || ''
    
    // ساخت URL کامل برای تصاویر
    let ogImageUrl: string[] = []
    if (post.og_image) {
      const ogImage = post.og_image.startsWith('http') 
        ? post.og_image 
        : `${strapiUrl}${post.og_image.startsWith('/') ? '' : '/'}${post.og_image}`
      ogImageUrl = [ogImage]
    } else if (post.featured_image) {
      const featuredImage = post.featured_image.startsWith('http')
        ? post.featured_image
        : `${strapiUrl}${post.featured_image.startsWith('/') ? '' : '/'}${post.featured_image}`
      ogImageUrl = [featuredImage]
    }

    const canonicalUrl = `${siteUrl}/blog/${slug}`

    // ساخت metadata کامل برای Next.js
    const metadata: Metadata = {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        images: ogImageUrl.length > 0 ? ogImageUrl : undefined,
        type: 'article',
        url: canonicalUrl,
        publishedTime: post.published_at || undefined,
        modifiedTime: post.updated_at || undefined,
        authors: post.author?.display_name ? [post.author.display_name] : undefined,
        tags: post.tags && post.tags.length > 0 ? post.tags.map((t) => t.name) : undefined,
        siteName: 'مشاور کنکور',
        locale: 'fa_IR',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: ogImageUrl.length > 0 ? ogImageUrl : undefined,
      },
      alternates: {
        canonical: canonicalUrl,
      },
      keywords: post.tags && post.tags.length > 0 
        ? post.tags.map((t) => t.name).join(', ')
        : undefined,
    }

    return metadata
  } catch (error) {
    console.error('SEO Metadata Error:', error)
    return { 
      title: 'مقاله یافت نشد',
      description: 'خطا در بارگذاری مقاله'
    }
  }
}

/**
 * Generate JSON-LD structured data for Article
 */
export function generateArticleStructuredData(post: any, siteUrl: string) {
  if (!post) return null

  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
  
  // ساخت URL کامل برای تصویر
  let imageUrl = ''
  if (post.og_image) {
    imageUrl = post.og_image.startsWith('http') 
      ? post.og_image 
      : `${strapiUrl}${post.og_image.startsWith('/') ? '' : '/'}${post.og_image}`
  } else if (post.featured_image) {
    imageUrl = post.featured_image.startsWith('http')
      ? post.featured_image
      : `${strapiUrl}${post.featured_image.startsWith('/') ? '' : '/'}${post.featured_image}`
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.excerpt || '',
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    author: post.author?.display_name ? {
      '@type': 'Person',
      name: post.author.display_name,
      ...(post.author.profile_image && {
        image: post.author.profile_image.startsWith('http')
          ? post.author.profile_image
          : `${strapiUrl}${post.author.profile_image.startsWith('/') ? '' : '/'}${post.author.profile_image}`
      })
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'مشاور کنکور',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon-light-32x32.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`
    },
    ...(post.category && {
      articleSection: post.category.name
    }),
    ...(post.tags && post.tags.length > 0 && {
      keywords: post.tags.map((t: any) => t.name).join(', ')
    })
  }

  return structuredData
}
