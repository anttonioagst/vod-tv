import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import { getFollowing } from '@/lib/supabase/queries/user-data'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const appUser = {
    name: user.user_metadata?.full_name ?? user.email ?? 'Usuário',
    avatar: user.user_metadata?.avatar_url ?? undefined,
  }

  const followedChannels = await getFollowing(user.id)
  const sidebarChannels = followedChannels.map((c) => ({
    name: c.name,
    slug: c.username.replace('@', ''),
    avatar: c.avatar || undefined,
  }))

  return (
    <AppShell isLoggedIn user={appUser} followedChannels={sidebarChannels}>
      {children}
    </AppShell>
  )
}
