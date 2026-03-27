import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { ThumbsUp } from 'lucide-react'

const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }

export default function LikedPage() {
  return (
    <AppShell isLoggedIn={true} activePath="/liked" user={mockUser}>
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
    </AppShell>
  )
}
