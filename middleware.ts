import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_URL = 'https://admin.tix-eg.com'

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
  const noSlugMatch = pathname.match(/^\/product\/(\d+)\/?$/)
  if (noSlugMatch) {
    const id = noSlugMatch[1]
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        headers: { Accept: 'application/json', 'Accept-Language': 'ar' },
        signal: AbortSignal.timeout(3000),
      })
      if (res.ok) {
        const data = await res.json()
        const slug = data?.data?.slug
        if (slug) {
          return NextResponse.redirect(
            new URL(`/product/${id}/${slug}`, request.url),
            { status: 301 }
          )
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
