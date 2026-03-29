import { notFound } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import ChannelHeader from '@/components/channel/ChannelHeader'
import ChannelTabs from '@/components/channel/ChannelTabs'
import ChannelVideoBar from '@/components/channel/ChannelVideoBar'
import VideoGrid from '@/components/video/VideoGrid'
import { mockChannels, mockVideos } from '@/lib/mock-data'

interface ChannelPageProps {
  params: Promise<{ slug: string }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { slug } = await params

  // Busca canal pelo slug (username sem @)
  const channel = mockChannels.find(
    (c) => c.username.replace('@', '') === slug
  )

  if (!channel) notFound()

  // Vídeos do canal (mockados — futuramente filtrar por channelSlug)
  const channelVideos = mockVideos.filter(
    (v) => v.channelSlug === slug
  )
  // Se não tiver vídeos específicos do canal, mostra todos como exemplo
  const videos = channelVideos.length > 0 ? channelVideos : mockVideos

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
