import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja, enUS, zhCN } from 'date-fns/locale'
import { getTranslations, getLocale } from 'next-intl/server'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Notification = {
  id: string
  type: string
  post_id: string | null
  read: boolean
  created_at: string
  actor: { id: string; username: string; avatar_url: string | null }
  post: { image_url: string } | null
}

const dateFnsLocales = { ja, en: enUS, zh: zhCN }

export default async function NotificationsPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  const user = session.user
  const supabase = createClient()

  const [{ data: raw }, t, locale] = await Promise.all([
    supabase
      .from('notifications')
      .select(`
        id, type, post_id, read, created_at,
        actor:users!notifications_actor_id_fkey(id, username, avatar_url),
        post:posts(image_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    getTranslations('notifications'),
    getLocale(),
  ])

  const notifications = ((raw ?? []) as unknown as Notification[]).map(n => ({
    ...n,
    actor: Array.isArray(n.actor) ? n.actor[0] : n.actor,
    post: Array.isArray(n.post) ? n.post[0] : n.post,
  }))

  const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
  if (unreadIds.length > 0) {
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
  }

  const dateLocale = dateFnsLocales[locale as 'ja' | 'en' | 'zh'] ?? ja

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 border-b border-[#E8E0D8]/60">
        <h1 className="font-mincho text-lg text-center">{t('title')}</h1>
      </header>

      <main>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <p className="font-playfair text-6xl text-[#E8E0D8] mb-6">✦</p>
            <p className="text-muted text-sm">{t('empty')}</p>
          </div>
        ) : (
          <div>
            {notifications.map(n => (
              <Link
                key={n.id}
                href={n.post_id ? `/post/${n.post_id}` : `/profile/${n.actor.id}`}
                className={`flex items-center gap-3 px-4 py-3 border-b border-[#E8E0D8]/50 hover:bg-[#F0E9E2]/50 transition-colors ${!n.read ? 'bg-[#FDF8F4]' : ''}`}
              >
                {n.actor.avatar_url ? (
                  <Image src={n.actor.avatar_url} alt={n.actor.username} width={44} height={44} className="rounded-full w-11 h-11 object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#E8E0D8] flex items-center justify-center flex-shrink-0">
                    <span className="text-muted text-sm">{n.actor.username[0]?.toUpperCase()}</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary leading-snug">
                    <span className="font-medium">{n.actor.username}</span>
                    {t(n.type as 'follow' | 'comment' | 'repost')}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: dateLocale })}
                  </p>
                </div>

                {n.post && (
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image src={n.post.image_url} alt="" fill className="object-cover" sizes="48px" />
                  </div>
                )}

                {!n.read && <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
