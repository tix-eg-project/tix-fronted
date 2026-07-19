import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'

const protectedPaths = [
  '/account',
  '/checkout',
  '/cart',
  '/wishlist',
]

export async function middleware(request: NextRequest) {
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

  // 301 redirect: /product/{id} → /product/{id}/{slug}
  // Only fires for URLs without a slug (old Google-indexed URLs)
  const noSlugMatch = pathname.match(/^\/product\/(\d+)\/?$/)
  if (noSlugMatch) {
    const id = noSlugMatch[1]
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        headers: { Accept: 'application/json', 'Accept-Language': 'ar' },
      })
      if (res.ok) {
        const data = await res.json()
        const slug = data?.data?.slug
        if (slug) {
          const destination = new URL(`/product/${id}/${slug}`, request.url)
          return NextResponse.redirect(destination, { status: 301 })
        }
      }
    } catch {}
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
