import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { locale } = await request.json()
  const valid = ['ja', 'en', 'zh']
  if (!valid.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return res
}
