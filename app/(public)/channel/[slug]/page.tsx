import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChannelHeader from '@/components/channel/ChannelHeader'
import ChannelTabs from '@/components/channel/ChannelTabs'
import ChannelVideoBar from '@/components/channel/ChannelVideoBar'
import VideoGrid from '@/components/video/VideoGrid'
import { getChannelBySlug } from '@/lib/supabase/queries/channels'
import { getChannelVideos } from '@/lib/supabase/queries/videos'
import { getIsFollowing } from '@/lib/supabase/queries/user-data'

interface ChannelPageProps {
  params: Promise<{ slug: string }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { slug } = await params

  const channel = await getChannelBySlug(slug)
  if (!channel) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [videos, isFollowing] = await Promise.all([
    getChannelVideos(channel.id),
    user ? getIsFollowing(user.id, channel.id) : Promise.resolve(false),
  ])

  return (
    <div className="px-4 pt-4 flex flex-col overflow-clip">
      <ChannelHeader
        channel={channel}
        bannerUrl={`https://picsum.photos/seed/${slug}-banner/1633/224`}
        isFollowing={isFollowing}
        isLoggedIn={!!user}
      />
      <ChannelTabs />
      <ChannelVideoBar />
      <VideoGrid videos={videos} size="medium" />
    </div>
  )
}
