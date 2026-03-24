import AppShell from '@/components/layout/AppShell'
import LoginCard from '@/components/auth/LoginCard'

export default function LoginPage() {
  return (
    <AppShell isLoggedIn={false}>
      <div className="flex items-center justify-center min-h-full py-12">
        <LoginCard />
      </div>
    </AppShell>
  )
}
