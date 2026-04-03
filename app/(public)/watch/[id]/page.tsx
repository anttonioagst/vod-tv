import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PaywallCard from '@/components/video/PaywallCard'
import VideoCard from '@/components/video/VideoCard'
import LikeButton from '@/components/video/LikeButton'
import { getVideoById, getRelatedVideos } from '@/lib/supabase/queries/videos'
import { getIsLiked } from '@/lib/supabase/queries/user-data'
import { recordView } from '@/lib/supabase/actions/video'

interface WatchPageProps {
  params: Promise<{ id: string }>
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params

  const video = await getVideoById(id)
  if (!video) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [related] = await Promise.allSettled([
    getRelatedVideos(video.channelId, video.id),
    recordView(video.id, user?.id),
  ])

  const relatedVideos = related.status === 'fulfilled' ? related.value : []
  const isLiked = user ? await getIsLiked(user.id, video.id) : false

  return (
    <div className="relative flex pt-4 px-4 overflow-clip min-h-[800px]">

      {/* Área principal — paywall */}
      <div className="flex-1 pr-[403px]">
        <div className="h-[800px] rounded-lg bg-surface-player
                        flex flex-col items-center justify-center gap-3">
          <PaywallCard channelName={video.channelSlug} />
        </div>
        <div className="mt-3 flex items-center gap-3 px-1">
          <LikeButton videoId={video.id} initialIsLiked={isLiked} isLoggedIn={!!user} />
        </div>
      </div>

      {/* Sidebar direita — vídeos relacionados */}
      <div className="absolute right-4 top-4 w-[387px] flex flex-col gap-4">
        {relatedVideos.map((v) => (
          <VideoCard key={v.id} video={v} size="medium" />
        ))}
      </div>

    </div>
  )
}
