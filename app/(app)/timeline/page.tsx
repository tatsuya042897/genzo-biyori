import { getSession } from '@/lib/auth'
import TimelineTabs from '@/components/timeline/TimelineTabs'
import Logo from '@/components/layout/Logo'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const session = await getSession()
  const user = session?.user

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-3 flex justify-center border-b border-[#E8E0D8]/60">
        <Logo size={44} />
      </header>

      <TimelineTabs currentUserId={user?.id ?? ''} />
    </div>
  )
}
