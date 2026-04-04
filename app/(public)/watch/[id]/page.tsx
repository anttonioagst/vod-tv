import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PaywallCard from '@/components/video/PaywallCard'
import VideoCard from '@/components/video/VideoCard'
import VideoPlayer from '@/components/video/VideoPlayer'
import LikeButton from '@/components/video/LikeButton'
import { getRelatedVideos } from '@/lib/supabase/queries/videos'
import { getVideoWithLiveData } from '@/lib/supabase/queries/lives'
import { getIsLiked } from '@/lib/supabase/queries/user-data'
import { recordView } from '@/lib/supabase/actions/video'

interface WatchPageProps {
  params: Promise<{ id: string }>
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params

  const videoData = await getVideoWithLiveData(id)
  if (!videoData) notFound()
  const { liveSession, ...video } = videoData

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [related] = await Promise.allSettled([
    getRelatedVideos(video.channelId, video.id),
    recordView(video.id, user?.id),
  ])

  const relatedVideos = related.status === 'fulfilled' ? related.value : []
  const isLiked = user ? await getIsLiked(user.id, video.id) : false

  let isSubscribed = false
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('channel_id', video.channelId)
      .maybeSingle()
    isSubscribed = !!sub
  }

  const showPlayer = !video.isExclusive || isSubscribed

  return (
    <div className="relative flex pt-4 px-4 overflow-clip min-h-[800px]">

      {/* Área principal */}
      <div className="flex-1 pr-[403px]">
        <div className="h-[800px] rounded-lg overflow-hidden bg-black flex flex-col">
          {showPlayer && video.hlsUrl ? (
            <VideoPlayer
              hlsUrl={video.hlsUrl}
              mp4Url={video.mp4Url ?? undefined}
              isLive={liveSession?.status === 'recording'}
              poster={video.thumbnail}
              title={video.title}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <PaywallCard channelName={video.channelSlug} />
            </div>
          )}
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
