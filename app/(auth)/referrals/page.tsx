import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Gift } from 'lucide-react'

export default function ReferralsPage() {
  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Gift size={24} />}
        title="Indicações"
        subtitle="Convide amigos e ganhe recompensas"
      />
      <EmptyState
        icon={<Gift size={48} />}
        title="Nenhuma indicação ainda"
        subtitle="Suas indicações aparecerão aqui"
      />
    </div>
  )
}
