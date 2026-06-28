'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from './NotificationBell'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

export default function BottomNav({ userId }: { userId: string }) {
  const pathname = usePathname()

  const isSearch = pathname === '/search'
  const isHome = pathname === '/timeline'
  const isProfile = pathname.startsWith('/profile')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-[#E8E0D8] z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        <Link
          href="/timeline"
          className={`flex flex-col items-center gap-0.5 transition-colors flex-1 ${isHome ? 'text-accent' : 'text-muted'}`}
        >
          <HomeIcon active={isHome} />
          <span className="text-[10px]">タイムライン</span>
        </Link>

        <Link
          href="/search"
          className={`flex flex-col items-center gap-0.5 transition-colors flex-1 ${isSearch ? 'text-accent' : 'text-muted'}`}
        >
          <SearchIcon active={isSearch} />
          <span className="text-[10px]">検索</span>
        </Link>

        <NotificationBell userId={userId} />

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-0.5 transition-colors flex-1 ${isProfile ? 'text-accent' : 'text-muted'}`}
        >
          <UserIcon active={isProfile} />
          <span className="text-[10px]">プロフィール</span>
        </Link>

        <Link
          href="/post/new"
          className="flex items-center justify-center w-12 h-12 bg-accent rounded-full text-white shadow-md hover:bg-[#C05530] transition-colors flex-shrink-0"
        >
          <PlusIcon />
        </Link>
      </div>
    </nav>
  )
}
