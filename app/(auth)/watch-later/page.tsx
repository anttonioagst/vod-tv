import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Clock } from 'lucide-react'

export default function WatchLaterPage() {
  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Clock size={24} />}
        title="Assistir mais tarde"
        subtitle="Vídeos salvos para ver depois"
      />
      <EmptyState
        icon={<Clock size={48} />}
        title="Nenhum vídeo salvo"
        subtitle="Vídeos salvos aparecerão aqui"
      />
    </div>
  )
}
