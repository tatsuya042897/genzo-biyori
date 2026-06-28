import { createClient } from '@/lib/supabase-server'
import TimelineTabs from '@/components/timeline/TimelineTabs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TimelinePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 text-center border-b border-[#E8E0D8]/60">
        <h1 className="font-playfair text-2xl font-medium text-primary">現像日和</h1>
      </header>

      <TimelineTabs currentUserId={user?.id ?? ''} />
    </div>
  )
}
