import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import VideoGrid from '@/components/video/VideoGrid'
import { ThumbsUp } from 'lucide-react'
import { getLikedVideos } from '@/lib/supabase/queries/user-data'

export default async function LikedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const videos = await getLikedVideos(user.id)

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<ThumbsUp size={24} />}
        title="Vídeos Curtidos"
        subtitle="Vídeos que você curtiu"
      />
      {videos.length > 0 ? (
        <VideoGrid videos={videos} size="medium" />
      ) : (
        <EmptyState
          icon={<ThumbsUp size={48} />}
          title="Nenhum vídeo curtido ainda"
          subtitle="Vídeos curtidos aparecerão aqui"
        />
      )}
    </div>
  )
}
