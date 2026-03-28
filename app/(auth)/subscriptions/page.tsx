import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Star } from 'lucide-react'

export default function SubscriptionsPage() {
  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Star size={24} />}
        title="Assinaturas"
        subtitle="Canais que você assina"
      />
      <EmptyState
        icon={<Star size={48} />}
        title="Nenhuma assinatura ainda"
        subtitle="Suas assinaturas aparecerão aqui"
      />
    </div>
  )
}
