import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { ThumbsUp } from 'lucide-react'

export default function LikedPage() {
  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<ThumbsUp size={24} />}
        title="Vídeos Curtidos"
        subtitle="Vídeos que você curtiu"
      />
      <EmptyState
        icon={<ThumbsUp size={48} />}
        title="Nenhum vídeo curtido ainda"
        subtitle="Vídeos curtidos aparecerão aqui"
      />
    </div>
  )
}
