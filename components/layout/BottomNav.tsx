'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-[#E8E0D8] z-50 safe-area-inset-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-4">
        <Link
          href="/timeline"
          className={`flex flex-col items-center gap-0.5 transition-colors ${pathname === '/timeline' ? 'text-accent' : 'text-muted'}`}
        >
          <HomeIcon active={pathname === '/timeline'} />
          <span className="text-xs">タイムライン</span>
        </Link>

        <Link
          href="/post/new"
          className="flex items-center justify-center w-12 h-12 bg-accent rounded-full text-white shadow-md hover:bg-[#C05530] transition-colors"
        >
          <PlusIcon />
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-0.5 transition-colors ${pathname.startsWith('/profile') ? 'text-accent' : 'text-muted'}`}
        >
          <UserIcon active={pathname.startsWith('/profile')} />
          <span className="text-xs">プロフィール</span>
        </Link>
      </div>
    </nav>
  )
}
