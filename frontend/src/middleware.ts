import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAdmin = pathname.startsWith('/admin')
  const isTeacher = pathname.startsWith('/teacher')
  const isProtected = isAdmin || isTeacher

  if (!isProtected) return NextResponse.next()

  const sessionId = req.cookies.get('sessionid')?.value
  if (!sessionId) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  try {
    const djangoUrl = process.env.DJANGO_INTERNAL_URL ?? 'http://127.0.0.1:8000'
    const r = await fetch(`${djangoUrl}/api/whoami/`, {
      credentials: 'include',
      headers: {
        'Cookie': req.headers.get('cookie') || '',
        'X-Forwarded-Proto': 'https',
      },
      redirect: 'error',
    })
    if (!r.ok) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    const user = await r.json()
    const userIsAdmin = user.is_superuser || user.role === 'admin'
    const userIsTeacher = user.is_teacher || user.role === 'teacher'

    if (isAdmin && !userIsAdmin) {
      return NextResponse.redirect(new URL('/teacher', req.url))
    }
    if (isTeacher && !userIsTeacher) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  } catch (e) {
    console.error('Middleware auth check failed:', e)
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*'],
}
