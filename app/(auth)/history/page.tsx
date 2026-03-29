import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import VideoGrid from '@/components/video/VideoGrid'
import { History } from 'lucide-react'
import { getWatchHistory } from '@/lib/supabase/queries/user-data'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const videos = await getWatchHistory(user.id)

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<History size={24} />}
        title="Histórico"
        subtitle="Vídeos que você assistiu"
      />
      {videos.length > 0 ? (
        <VideoGrid videos={videos} size="medium" />
      ) : (
        <EmptyState
          icon={<History size={48} />}
          title="Histórico vazio"
          subtitle="Seu histórico aparecerá aqui"
        />
      )}
    </div>
  )
}
