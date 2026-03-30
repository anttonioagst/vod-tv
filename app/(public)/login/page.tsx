import AppShell from '@/components/layout/AppShell'
import LoginCard from '@/components/auth/LoginCard'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams
  return (
    <AppShell isLoggedIn={false}>
      <div className="flex items-center justify-center min-h-full py-12">
        <LoginCard urlError={error} />
      </div>
    </AppShell>
  )
}
