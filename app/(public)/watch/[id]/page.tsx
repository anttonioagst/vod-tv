import { notFound } from 'next/navigation'
import PaywallCard from '@/components/video/PaywallCard'
import VideoCard from '@/components/video/VideoCard'
import { getVideoById, getRelatedVideos } from '@/lib/supabase/queries/videos'

interface WatchPageProps {
  params: Promise<{ id: string }>
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params

  const video = await getVideoById(id)
  if (!video) notFound()

  const related = await getRelatedVideos(video.channelId, video.id)

  return (
    <div className="relative flex pt-4 px-4 overflow-hidden min-h-[800px]">

      {/* Área principal — paywall */}
      <div className="flex-1 pr-[403px]">
        <div className="h-[800px] rounded-[10px] bg-[#171717]
                        flex flex-col items-center justify-center gap-3">
          <PaywallCard channelName={video.channelSlug} />
        </div>
      </div>

      {/* Sidebar direita — vídeos relacionados */}
      <div className="absolute right-4 top-4 w-[387px] flex flex-col gap-4">
        {related.map((v) => (
          <VideoCard key={v.id} video={v} size="medium" />
        ))}
      </div>

    </div>
  )
}
