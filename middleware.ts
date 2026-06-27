import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, {
              ...options,
              // セッションを永続化（30日）
              maxAge: 60 * 60 * 24 * 30,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          })
        },
      },
    }
  )

  // セッションを毎リクエスト時にリフレッシュ
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith('/auth')
  const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname === '/manifest.json' || pathname === '/favicon.ico'

  if (isPublicAsset) return res

  // ログイン済みでauth画面にいる場合 → タイムラインへ
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/timeline', req.url))
  }

  // 未ログインでapp画面にいる場合 → ログインへ
  if (!session && !isAuthPage && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*).*)'],
}
