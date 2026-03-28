import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'

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

  return (
    <AppShell isLoggedIn activePath={undefined} user={appUser}>
      {children}
    </AppShell>
  )
}
