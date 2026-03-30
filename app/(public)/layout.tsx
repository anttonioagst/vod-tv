import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const appUser = user
    ? {
        name: user.user_metadata?.full_name ?? user.email ?? 'Usuário',
        avatar: user.user_metadata?.avatar_url ?? undefined,
      }
    : undefined

  return (
    <AppShell isLoggedIn={!!user} user={appUser}>
      {children}
    </AppShell>
  )
}
