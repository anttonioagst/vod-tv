import VideoGrid from '@/components/video/VideoGrid'
import ChannelRow from '@/components/channel/ChannelRow'
import { Tv } from 'lucide-react'
import { getHomeVideos } from '@/lib/supabase/queries/videos'
import { getFeaturedChannels } from '@/lib/supabase/queries/channels'

export default async function HomePage() {
  const [videos, channels] = await Promise.all([
    getHomeVideos(),
    getFeaturedChannels(8),
  ])

  const largeVideos = videos.slice(0, 3)
  const mediumVideos = videos.slice(3)

  return (
    <div className="p-[16px]">
      <VideoGrid videos={largeVideos} size="large" />
      <ChannelRow
        channels={channels}
        title="Canais Para Assistir"
        titleIcon={<Tv size={20} className="text-white" />}
      />
      <VideoGrid videos={mediumVideos} size="medium" />
    </div>
  )
}
