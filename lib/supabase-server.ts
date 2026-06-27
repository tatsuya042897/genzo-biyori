import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './supabase'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Partial<ResponseCookie>) {
          try {
            cookieStore.set(name, value, options)
          } catch {}
        },
        remove(name: string, options: Partial<ResponseCookie>) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch {}
        },
      },
    }
  )
}
