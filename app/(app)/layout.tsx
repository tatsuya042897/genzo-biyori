import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import BottomNav from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav userId={user.id} />
    </div>
  )
}
