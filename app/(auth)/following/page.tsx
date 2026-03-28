import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Heart } from 'lucide-react'

export default function FollowingPage() {
  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Heart size={24} />}
        title="Seguindo"
        subtitle="Canais que você segue"
      />
      <EmptyState
        icon={<Heart size={48} />}
        title="Você não segue nenhum canal"
        subtitle="Canais que você segue aparecerão aqui"
      />
    </div>
  )
}
