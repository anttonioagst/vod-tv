import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Link2 } from 'lucide-react'

const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }

export default function AffiliatesPage() {
  return (
    <AppShell isLoggedIn={true} activePath="/affiliates" user={mockUser}>
      <div className="p-[16px]">
        <PageHeader
          icon={<Link2 size={24} />}
          title="Afiliados"
          subtitle="Programa de afiliados Vod.TV"
        />
        <EmptyState
          icon={<Link2 size={48} />}
          title="Programa de afiliados"
          subtitle="Você ainda não é afiliado"
        />
        <div className="flex justify-center mt-2">
          <Link
            href="/affiliates/apply"
            className="bg-accent text-accent-fg rounded-sm px-4 py-2 font-medium text-base"
          >
            Aplicar como afiliado
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
