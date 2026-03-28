import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { History } from 'lucide-react'

export default function HistoryPage() {
  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<History size={24} />}
        title="Histórico"
        subtitle="Vídeos que você assistiu"
      />
      <EmptyState
        icon={<History size={48} />}
        title="Histórico vazio"
        subtitle="Seu histórico aparecerá aqui"
      />
    </div>
  )
}
