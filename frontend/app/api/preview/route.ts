import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  // Check the secret and slug parameters
  // This should match the PREVIEW_SECRET from your Strapi .env file
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 })
  }

  // Enable Draft Mode by setting the cookie
  const draft = await draftMode()
  draft.enable()

  // Redirect to the path from the query string
  // Make sure `slug` is a valid path
  redirect(`/blog/${slug}`)
}

