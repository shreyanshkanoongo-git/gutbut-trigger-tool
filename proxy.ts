import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/log', '/history', '/insights', '/experiments', '/profile', '/my-info', '/onboarding']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get('sb-gutbut-session')
  if (!session?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user has already completed onboarding, redirect them away from /onboarding
  if (pathname.startsWith('/onboarding')) {
    const onboarded = request.cookies.get('gutbut-onboarded')
    if (onboarded?.value) {
      return NextResponse.redirect(new URL('/log', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/log/:path*',
    '/history/:path*',
    '/insights/:path*',
    '/experiments/:path*',
    '/profile/:path*',
    '/my-info/:path*',
    '/onboarding/:path*',
  ],
}
