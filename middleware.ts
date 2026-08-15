import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import slugMap from '@/lib/product-slug-map.json'

const protectedPaths = [
  '/account',
  '/checkout',
  '/cart',
  '/wishlist',
]

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // Auth protection
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // encode non-ASCII chars in slug for safe Location header (keeps hyphens as-is)
  function encodeSlug(slug: string) {
    return slug.replace(/[^\x00-\x7F-]/g, c => encodeURIComponent(c))
  }

  // 301 redirect: /product/{id} → /product/{id}/{slug}
  const noSlugMatch = pathname.match(/^\/product\/(\d+)\/?$/)
  if (noSlugMatch) {
    const id = noSlugMatch[1]
    const slug = (slugMap as Record<string, string>)[id]
    if (slug) {
      return NextResponse.redirect(
        new URL(`/product/${id}/${encodeSlug(slug)}`, request.url),
        { status: 301 }
      )
    }
  }

  // 301 redirect: /product/{id}/{old-slug} → /product/{id}/{new-slug}
  // handles product name changes — slug map is regenerated on each build
  const withSlugMatch = pathname.match(/^\/product\/(\d+)\/([^/]+)\/?$/)
  if (withSlugMatch) {
    const [, id, urlSlug] = withSlugMatch
    const correctSlug = (slugMap as Record<string, string>)[id]
    // compare decoded URL slug with slug map entry
    const decodedUrlSlug = decodeURIComponent(urlSlug)
    if (correctSlug && decodedUrlSlug !== correctSlug) {
      return NextResponse.redirect(
        new URL(`/product/${id}/${encodeSlug(correctSlug)}`, request.url),
        { status: 301 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout',
    '/cart',
    '/login',
    '/register',
    '/product/:path*',
  ],
}
