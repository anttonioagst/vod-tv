import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import VideoGrid from '@/components/video/VideoGrid'
import { Clock } from 'lucide-react'
import { getWatchLater } from '@/lib/supabase/queries/user-data'

export default async function WatchLaterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const videos = await getWatchLater(user.id)

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Clock size={24} />}
        title="Assistir mais tarde"
        subtitle="Vídeos salvos para ver depois"
      />
      {videos.length > 0 ? (
        <VideoGrid videos={videos} size="medium" />
      ) : (
        <EmptyState
          icon={<Clock size={48} />}
          title="Nenhum vídeo salvo"
          subtitle="Vídeos salvos aparecerão aqui"
        />
      )}
    </div>
  )
}
