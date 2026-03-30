import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginCard from '@/components/auth/LoginCard'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/home')
  }

  const { error } = await searchParams
  return (
    <div className="flex items-center justify-center min-h-full py-12">
      <LoginCard urlError={error} />
    </div>
  )
}
