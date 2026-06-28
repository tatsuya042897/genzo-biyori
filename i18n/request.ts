import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const LOCALES = ['ja', 'en', 'zh'] as const
type Locale = typeof LOCALES[number]

export default getRequestConfig(async () => {
  const raw = cookies().get('NEXT_LOCALE')?.value ?? 'ja'
  const locale: Locale = (LOCALES as readonly string[]).includes(raw) ? (raw as Locale) : 'ja'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
