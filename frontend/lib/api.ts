const STRAPI_API_URL = (typeof window === 'undefined' && process.env.STRAPI_API_URL)
  ? process.env.STRAPI_API_URL
  : (process.env.NEXT_PUBLIC_STRAPI_API_URL || '')

// Django API URL for other endpoints
const DJANGO_API_URL = (typeof window === 'undefined' && process.env.INTERNAL_API_URL)
  ? process.env.INTERNAL_API_URL
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')

export interface Author {
  id: number
  display_name: string
  bio: string
  expertise: string
  profile_image: string | null
  twitter_url?: string
  linkedin_url?: string
  instagram_url?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  grade?: string
  field?: string
  meta_description?: string
  post_count?: number
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface MenuItem {
  id: number
  label: string
  url: string
  category?: Category
  icon?: string
  order: number
  isActive: boolean
  openInNewTab: boolean
}

export interface BlogNavigation {
  mainMenuItems: MenuItem[]
  filterMenuItems: MenuItem[]
}

export interface Post {
  id: number
  title: string
  slug: string
  subtitle?: string
  excerpt: string
  content: string
  featured_image: string | null
  featured_image_alt?: string
  author: Author
  category: Category
  tags: Tag[]
  status: string
  published_at: string
  updated_at: string
  reading_time: number
  view_count: number
  meta_title?: string
  meta_description?: string
  og_image?: string | null
  key_points?: string[]
  faq?: Array<{ question: string; answer: string }>
  related_posts?: Post[]
  enable_comments: boolean
  comment_count?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Comment {
  id: number
  post: number
  parent: number | null
  user?: number | null
  name: string
  email: string
  content: string
  rating: number | null
  is_approved: boolean
  created_at: string
  replies?: Comment[]
}

async function fetchStrapiAPI<T>(endpoint: string, options?: { isDraftMode?: boolean }): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  // Enable content source maps in preview mode (for Live Preview)
  if (options?.isDraftMode) {
    headers['strapi-encode-source-maps'] = 'true'
  }

  const url = `${STRAPI_API_URL}${endpoint}`

  // Log the URL in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 Fetching from Strapi: ${url}`)
  }

  try {
    const res = await fetch(url, {
      headers,
      credentials: 'include'
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('یافت نشد')
      // Log error details for debugging
      const errorText = await res.text().catch(() => '')
      console.error(`Strapi API Error ${res.status}:`, errorText)
      throw new Error(`خطای API: ${res.status} - ${errorText.substring(0, 100)}`)
    }

    return res.json()
  } catch (error: any) {
    // Handle network errors (fetch failed)
    if (error.message === 'fetch failed' || error.name === 'TypeError' || error.code === 'ECONNREFUSED') {
      console.error(`❌ خطا در اتصال به Strapi API: ${url}`)
      console.error('💡 مطمئن شوید که Strapi در حال اجرا است:')
      console.error(`   - بررسی کنید که Strapi روی ${STRAPI_API_URL} در حال اجرا است`)
      console.error(`   - دستور: cd blog-api && npm run develop`)
      throw new Error(
        `خطا در اتصال به Strapi API (${STRAPI_API_URL}). ` +
        `لطفاً مطمئن شوید که سرور Strapi در حال اجرا است. ` +
        `برای راه‌اندازی: cd blog-api && npm run develop`
      )
    }
    // Re-throw other errors
    throw error
  }
}

function assetUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  // Strapi media files are served from the root
  return `${STRAPI_API_URL}${url}`
}

// Strapi response mapping functions
function mapStrapiAuthor(item: any): Author {
  if (!item) return {} as Author

  // In Strapi v5, data is directly on the item
  const a = item || {}
  // Handle profile image - In Strapi v5, media is directly: { id, url, ... }
  const img = a.profileImage?.url || null

  return {
    id: a.id || 0,
    display_name: a.displayName || '',
    bio: a.bio || '',
    expertise: a.expertise || '',
    profile_image: assetUrl(img),
    twitter_url: a.twitterUrl || undefined,
    linkedin_url: a.linkedinUrl || undefined,
    instagram_url: a.instagramUrl || undefined,
  }
}

function mapStrapiCategory(item: any): Category {
  if (!item) return {
    id: 0,
    name: 'بدون دسته‌بندی',
    slug: 'uncategorized',
    description: '',
  } as Category

  // In Strapi v5, data is directly on the item
  const c = item || {}
  return {
    id: c.id || 0,
    name: c.name || '',
    slug: c.slug || '',
    description: c.description || '',
    grade: c.grade || undefined,
    field: c.field || undefined,
    meta_description: c.metaDescription || undefined,
    post_count: undefined,
  }
}

function mapStrapiTag(item: any): Tag {
  // In Strapi v5, data is directly on the item
  const t = item || {}
  return { id: t.id || 0, name: t.name || '', slug: t.slug || '' }
}

function mapStrapiPost(item: any): Post {
  // In Strapi v5, data is directly on the item, not in attributes!
  // Structure: { id, title, slug, content, featuredImage: { url, ... }, author: {...}, category: {...} }
  const p = item || {}

  // Handle featured image - In Strapi v5, media is directly: { id, url, ... }
  const featured = p.featuredImage?.url || null
  const ogImg = p.ogImage?.url || null

  // Handle relations - In Strapi v5, relations are directly: { id, name, ... } or null
  let author: Author = {} as Author
  if (p.author && typeof p.author === 'object' && p.author.id) {
    author = mapStrapiAuthor(p.author)
  }

  let category: Category = {
    id: 0,
    name: 'بدون دسته‌بندی',
    slug: 'uncategorized',
    description: '',
  } as Category
  if (p.category && typeof p.category === 'object' && p.category.id) {
    category = mapStrapiCategory(p.category)
  }

  const tags = Array.isArray(p.tags) ? p.tags.map(mapStrapiTag) : []

  // Handle publishedAt - Strapi uses publishedAt for published content
  const publishedAt = p.publishedAt || p.createdAt || null
  const updatedAt = p.updatedAt || p.createdAt || null

  // Handle content - In Strapi v5, content is directly a string
  const content = typeof p.content === 'string' ? p.content : (p.content ? String(p.content) : '')

  // Extract excerpt - if null, use first part of content or title
  let excerpt = p.excerpt
  if (!excerpt && content) {
    // Extract first 150 characters from content (remove HTML tags if any)
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '')
  }
  if (!excerpt) {
    excerpt = p.title || 'بدون خلاصه'
  }

  const mappedPost = {
    id: p.id || 0,
    title: p.title || 'بدون عنوان',
    slug: p.slug || '',
    subtitle: p.subtitle || undefined,
    excerpt: excerpt,
    content: content,
    featured_image: assetUrl(featured),
    featured_image_alt: p.featuredImageAlt || undefined,
    author,
    category,
    tags,
    status: publishedAt ? 'published' : 'draft',
    published_at: publishedAt ? new Date(publishedAt).toISOString() : '',
    updated_at: updatedAt ? new Date(updatedAt).toISOString() : '',
    reading_time: p.readingTime || 0,
    view_count: p.viewCount || 0,
    meta_title: p.metaTitle || undefined,
    meta_description: p.metaDescription || undefined,
    og_image: assetUrl(ogImg) || null,
    key_points: Array.isArray(p.keyPoints) ? p.keyPoints : [],
    faq: Array.isArray(p.faq) ? p.faq : [],
    related_posts: Array.isArray(p.related_posts) ? p.related_posts.map(mapStrapiPost) : [],
    enable_comments: p.enableComments ?? true,
    comment_count: p.commentCount || 0,
  }

  return mappedPost
}

export async function apiRequest(path: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET', body?: any, token?: string): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Use Django API for non-blog endpoints
  const url = `${DJANGO_API_URL}${path}`

  try {
    console.log(`[API Request] ${method} ${url}`, body ? { body } : '')

    // ایجاد AbortController برای timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    console.log(`[API Response] ${res.status} ${res.statusText}`)

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data?.detail || data?.error || data?.message || `API error: ${res.status}`)
    }

    return data
  } catch (error: any) {
    console.error(`[API Error] ${method} ${url}:`, error)

    // اگر خطای شبکه باشد (مثل Failed to fetch)
    if (error.name === 'AbortError' || error.message === 'The user aborted a request.') {
      throw new Error('سرور پاسخ نمی‌دهد (timeout). لطفاً مطمئن شوید که backend در حال اجرا است.')
    }

    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`خطا در اتصال به سرور (${url}). لطفاً مطمئن شوید که backend در حال اجرا است.`)
    }

    throw error
  }
}

// تابع برای تست اتصال به backend
export async function testConnection(): Promise<boolean> {
  try {
    // استفاده از fetch مستقیم برای تست ساده‌تر
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 seconds timeout

    const response = await fetch(`${DJANGO_API_URL}/api/health/`, {
      method: 'GET',
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      return data?.status === 'ok'
    }
    return false
  } catch (error: any) {
    // خطا را log می‌کنیم اما exception نمی‌دهیم
    console.warn('تست اتصال به backend ناموفق بود:', error.message || error)
    return false
  }
}

export async function sendOTP(email: string): Promise<void> {
  await apiRequest('/api/auth/send-otp/', 'POST', { email })
}

export async function verifyOTP(email: string, code: string): Promise<{ access: string; refresh: string; is_new_user?: boolean }> {
  return apiRequest('/api/auth/verify-otp/', 'POST', { email, code })
}

export async function getProfile(token: string): Promise<any> {
  return apiRequest('/api/profile/', 'GET', undefined, token)
}

export async function updateProfile(data: Record<string, any>, token: string): Promise<any> {
  return apiRequest('/api/profile/update/', 'POST', data, token)
}

export async function getNotifications(token: string): Promise<Array<{ id: number; title: string; body: string; created_at: string }>> {
  return apiRequest('/api/notifications/', 'GET', undefined, token)
}

export async function sendTestNotification(token: string, payload: { title: string; body: string }): Promise<any> {
  return apiRequest('/api/notifications/test/', 'POST', payload, token)
}

export async function getPosts(params?: {
  page?: number
  search?: string
  category?: string
  grade?: string
  field?: string
  tag?: string
  ordering?: string
}): Promise<PaginatedResponse<Post>> {
  const sp = new URLSearchParams()
  sp.set('pagination[page]', String(params?.page || 1))
  sp.set('pagination[pageSize]', '12')
  // Populate all relations - Strapi v5 uses populate=* for all fields
  sp.set('populate', '*')
  sp.set('filters[publishedAt][$notNull]', 'true')

  // Strapi sorting
  if (params?.ordering) {
    const orderMap: Record<string, string> = {
      '-published_at': 'publishedAt:desc',
      'published_at': 'publishedAt:asc',
      '-view_count': 'viewCount:desc',
      'view_count': 'viewCount:asc',
      '-reading_time': 'readingTime:desc',
      'reading_time': 'readingTime:asc',
    }
    sp.set('sort', orderMap[params.ordering] || 'publishedAt:desc')
  } else {
    sp.set('sort', 'publishedAt:desc')
  }

  // Search
  if (params?.search) {
    sp.set('filters[$or][0][title][$containsi]', params.search)
    sp.set('filters[$or][1][excerpt][$containsi]', params.search)
    sp.set('filters[$or][2][content][$containsi]', params.search)
  }

  // Category filter
  if (params?.category) {
    sp.set('filters[category][slug][$eq]', params.category)
  }

  // Grade filter
  if (params?.grade) {
    sp.set('filters[category][grade][$eq]', params.grade)
  }

  // Field filter
  if (params?.field) {
    sp.set('filters[category][field][$eq]', params.field)
  }

  // Tag filter
  if (params?.tag) {
    sp.set('filters[tags][slug][$eq]', params.tag)
  }

  if (!STRAPI_API_URL) {
    return { count: 0, next: null, previous: null, results: [] }
  }
  const data = await fetchStrapiAPI<any>(`/api/posts?${sp.toString()}`)
  const items = Array.isArray(data?.data) ? data.data.map(mapStrapiPost) : []
  const total = data?.meta?.pagination?.total || items.length
  return { count: total, next: data?.meta?.pagination?.page < data?.meta?.pagination?.pageCount ? 'next' : null, previous: data?.meta?.pagination?.page > 1 ? 'previous' : null, results: items }
}

export async function getPost(slug: string, isDraftMode: boolean = false): Promise<Post> {
  const sp = new URLSearchParams()
  sp.set('filters[slug][$eq]', slug)
  // Populate all relations - Strapi v5 uses populate=* for all fields
  sp.set('populate', '*')

  // In draft mode, we want to get draft content, so don't filter by publishedAt
  if (!isDraftMode) {
    sp.set('filters[publishedAt][$notNull]', 'true')
  } else {
    // For draft mode, we can get both draft and published content
    // Strapi will return draft if available when status=draft is passed
    sp.set('status', 'draft')
  }

  if (!STRAPI_API_URL) {
    throw new Error('یافت نشد')
  }
  const data = await fetchStrapiAPI<any>(`/api/posts?${sp.toString()}`, { isDraftMode })
  const item = Array.isArray(data?.data) && data.data.length > 0 ? data.data[0] : null
  if (!item) throw new Error('یافت نشد')
  return mapStrapiPost(item)
}

export async function getPopularPosts(): Promise<Post[]> {
  const sp = new URLSearchParams()
  sp.set('sort', 'viewCount:desc')
  sp.set('pagination[pageSize]', '6')
  sp.set('populate', '*')
  sp.set('filters[publishedAt][$notNull]', 'true')

  if (!STRAPI_API_URL) {
    return []
  }
  const data = await fetchStrapiAPI<any>(`/api/posts?${sp.toString()}`)
  return Array.isArray(data?.data) ? data.data.map(mapStrapiPost) : []
}

export async function getRecentPosts(): Promise<Post[]> {
  const sp = new URLSearchParams()
  sp.set('sort', 'publishedAt:desc')
  sp.set('pagination[pageSize]', '6')
  sp.set('populate', '*')
  sp.set('filters[publishedAt][$notNull]', 'true')

  if (!STRAPI_API_URL) {
    return []
  }
  const data = await fetchStrapiAPI<any>(`/api/posts?${sp.toString()}`)
  return Array.isArray(data?.data) ? data.data.map(mapStrapiPost) : []
}

export async function getCategories(): Promise<Category[]> {
  if (!STRAPI_API_URL) {
    return []
  }
  const data = await fetchStrapiAPI<any>('/api/categories?populate=*')
  return Array.isArray(data?.data) ? data.data.map(mapStrapiCategory) : []
}

export async function getCategory(slug: string): Promise<Category> {
  const sp = new URLSearchParams()
  sp.set('filters[slug][$eq]', slug)
  sp.set('populate', '*')
  if (!STRAPI_API_URL) {
    throw new Error('یافت نشد')
  }
  const data = await fetchStrapiAPI<any>(`/api/categories?${sp.toString()}`)
  const item = Array.isArray(data?.data) && data.data.length > 0 ? data.data[0] : null
  if (!item) throw new Error('یافت نشد')
  return mapStrapiCategory(item)
}

export async function getCategoryPosts(slug: string, page?: number): Promise<PaginatedResponse<Post>> {
  const sp = new URLSearchParams()
  sp.set('pagination[page]', String(page || 1))
  sp.set('pagination[pageSize]', '12')
  sp.set('populate', '*')
  sp.set('filters[category][slug][$eq]', slug)
  sp.set('filters[publishedAt][$notNull]', 'true')
  sp.set('sort', 'publishedAt:desc')

  if (!STRAPI_API_URL) {
    return { count: 0, next: null, previous: null, results: [] }
  }
  const data = await fetchStrapiAPI<any>(`/api/posts?${sp.toString()}`)
  const items = Array.isArray(data?.data) ? data.data.map(mapStrapiPost) : []
  const total = data?.meta?.pagination?.total || items.length
  return { count: total, next: data?.meta?.pagination?.page < data?.meta?.pagination?.pageCount ? 'next' : null, previous: data?.meta?.pagination?.page > 1 ? 'previous' : null, results: items }
}

export async function getTags(): Promise<Tag[]> {
  if (!STRAPI_API_URL) {
    return []
  }
  const data = await fetchStrapiAPI<any>('/api/tags?populate=*')
  return Array.isArray(data?.data) ? data.data.map(mapStrapiTag) : []
}

export async function getTagPosts(slug: string, page?: number): Promise<PaginatedResponse<Post>> {
  const sp = new URLSearchParams()
  sp.set('pagination[page]', String(page || 1))
  sp.set('pagination[pageSize]', '12')
  sp.set('populate', '*')
  sp.set('filters[tags][slug][$eq]', slug)
  sp.set('filters[publishedAt][$notNull]', 'true')
  sp.set('sort', 'publishedAt:desc')

  if (!STRAPI_API_URL) {
    return { count: 0, next: null, previous: null, results: [] }
  }
  const data = await fetchStrapiAPI<any>(`/api/posts?${sp.toString()}`)
  const items = Array.isArray(data?.data) ? data.data.map(mapStrapiPost) : []
  const total = data?.meta?.pagination?.total || items.length
  return { count: total, next: data?.meta?.pagination?.page < data?.meta?.pagination?.pageCount ? 'next' : null, previous: data?.meta?.pagination?.page > 1 ? 'previous' : null, results: items }
}

export async function getAuthors(): Promise<Author[]> {
  if (!STRAPI_API_URL) {
    return []
  }
  const data = await fetchStrapiAPI<any>('/api/authors?populate=*')
  return Array.isArray(data?.data) ? data.data.map(mapStrapiAuthor) : []
}

function mapStrapiMenuItem(item: any): MenuItem {
  const m = item || {}
  return {
    id: m.id || 0,
    label: m.label || '',
    url: m.url || '#',
    category: m.category ? mapStrapiCategory(m.category) : undefined,
    icon: m.icon || undefined,
    order: m.order || 0,
    isActive: m.isActive !== false,
    openInNewTab: m.openInNewTab || false,
  }
}

export async function getBlogNavigation(): Promise<BlogNavigation> {
  if (!STRAPI_API_URL) {
    return { mainMenuItems: [], filterMenuItems: [] }
  }
  const data = await fetchStrapiAPI<any>('/api/blog-navigation?populate=*')
  const nav = data?.data || data || {}
  return {
    mainMenuItems: Array.isArray(nav.mainMenuItems) ? nav.mainMenuItems.map(mapStrapiMenuItem).filter((item: MenuItem) => item.isActive) : [],
    filterMenuItems: Array.isArray(nav.filterMenuItems) ? nav.filterMenuItems.map(mapStrapiMenuItem).filter((item: MenuItem) => item.isActive) : [],
  }
}

export async function submitComment(
  postSlug: string,
  commentData: { name: string; email: string; content: string; rating?: number }
): Promise<Comment> {
  // Note: Strapi doesn't have comments built-in, you'll need to create a Comment content type
  // For now, this will throw an error
  throw new Error('API نظرات در Strapi پیکربندی نشده است. لطفاً یک نوع محتوای Comment ایجاد کنید.')
}

// ----------------------
// Planner API Functions
// ----------------------

export interface PlannerFormData {
  examProvider: string
  examDate: string
  dailyHours: number
  school: Array<{ day: string; has: boolean; start: string; end: string }>
  hasExistingSchoolPlan: boolean
  week1: Array<{ day: string; has: boolean; start: string; end: string }>
  week2: Array<{ day: string; has: boolean; start: string; end: string }>
  classes: Array<{ lesson: string; day: string; start: string; end: string }>
  subjects: Record<string, { checked: boolean; level: "weak" | "mid" | "strong" }>
  commitments: Array<{ text: string; minutes: number }>
  lightEnabled: boolean
  lightDay: string
  generals: Record<string, { days: number; target?: number }>
}

export interface PlannerRequest {
  id: number
  exam_provider: string
  exam_date: string
  daily_hours: number
  form_data: PlannerFormData
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed'
  generated_plan: any | null
  exam_code: string | null
  target_rank: number | null
  period_days: number
  created_at: string
  updated_at: string
  expires_at: string
}

export interface LLMPlannerData {
  request_id: number
  user_id: number
  user_profile: {
    name: string
    grade: string
    field: string
    daily_hours: number
  }
  exam: {
    provider: string
    date: string
    code: string
  }
  constraints: PlannerFormData
  target_rank: number | null
  period_days: number
}

/**
 * ایجاد درخواست برنامه‌ریزی جدید (ذخیره به صورت draft)
 */
export async function createPlannerRequest(
  formData: PlannerFormData,
  token: string
): Promise<PlannerRequest> {
  return apiRequest('/api/planner/create/', 'POST', { form_data: formData }, token)
}

/**
 * ارسال درخواست برای پردازش LLM
 */
export async function submitPlannerRequest(
  requestId: number,
  token: string
): Promise<{ message: string; data: PlannerRequest }> {
  return apiRequest(`/api/planner/${requestId}/submit/`, 'POST', undefined, token)
}

/**
 * دریافت یک درخواست برنامه‌ریزی
 */
export async function getPlannerRequest(
  requestId: number,
  token: string
): Promise<PlannerRequest> {
  return apiRequest(`/api/planner/${requestId}/`, 'GET', undefined, token)
}

/**
 * لیست درخواست‌های برنامه‌ریزی کاربر
 */
export async function listPlannerRequests(
  token: string
): Promise<{ results: PlannerRequest[]; count: number }> {
  return apiRequest('/api/planner/list/', 'GET', undefined, token)
}

/**
 * دریافت داده‌های کامل برای ارسال به LLM
 */
export async function getPlannerForLLM(
  requestId: number,
  token: string
): Promise<LLMPlannerData> {
  return apiRequest(`/api/planner/${requestId}/llm-data/`, 'GET', undefined, token)
}
