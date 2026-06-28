import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import BottomNav from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav userId={session.user.id} />
    </div>
  )
}
