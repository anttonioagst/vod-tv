import { notFound } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import ChannelHeader from '@/components/channel/ChannelHeader'
import ChannelTabs from '@/components/channel/ChannelTabs'
import ChannelVideoBar from '@/components/channel/ChannelVideoBar'
import VideoGrid from '@/components/video/VideoGrid'
import { getChannelBySlug } from '@/lib/supabase/queries/channels'
import { getChannelVideos } from '@/lib/supabase/queries/videos'

interface ChannelPageProps {
  params: Promise<{ slug: string }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { slug } = await params

  const channel = await getChannelBySlug(slug)
  if (!channel) notFound()

  const videos = await getChannelVideos(channel.id)

  return (
    <AppShell isLoggedIn={false} activePath="">
      <div className="px-4 pt-4 flex flex-col">
        <ChannelHeader
          channel={channel}
          bannerUrl={`https://picsum.photos/seed/${slug}-banner/1633/224`}
        />
        <ChannelTabs />
        <ChannelVideoBar />
        <VideoGrid videos={videos} size="medium" />
      </div>
    </AppShell>
  )
}
