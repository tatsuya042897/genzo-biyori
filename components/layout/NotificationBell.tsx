'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function NotificationBell({ userId }: { userId: string }) {
  const [unread, setUnread] = useState(0)
  const pathname = usePathname()
  const isActive = pathname === '/notifications'

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    // 初回取得
    supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('read', false)
      .then(({ count }) => setUnread(count ?? 0))

    // リアルタイム購読
    const channel = supabase
      .channel('notification-bell')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => {
        setUnread(c => c + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // 通知ページを開いたらバッジをリセット
  useEffect(() => {
    if (isActive) setUnread(0)
  }, [isActive])

  return (
    <Link
      href="/notifications"
      className={`flex flex-col items-center gap-0.5 transition-colors flex-1 relative ${isActive ? 'text-accent' : 'text-muted'}`}
    >
      <div className="relative">
        <BellIcon active={isActive} />
        {unread > 0 && !isActive && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
            <span className="text-white text-[9px] font-bold leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          </span>
        )}
      </div>
      <span className="text-[10px]">通知</span>
    </Link>
  )
}

function BellIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
