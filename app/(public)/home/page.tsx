import AppShell from '@/components/layout/AppShell'
import VideoGrid from '@/components/video/VideoGrid'
import ChannelRow from '@/components/channel/ChannelRow'
import { Tv } from 'lucide-react'
import { mockVideos, mockChannels } from '@/lib/mock-data'

export default function HomePage() {
  const largeVideos = mockVideos.slice(0, 3)
  const mediumVideos = mockVideos.slice(3)

  return (
    <AppShell isLoggedIn={false} activePath="/home">
      <div className="p-[16px]">
        {/* Seção 1: Vídeos em destaque (large, 3 por linha) */}
        <VideoGrid videos={largeVideos} size="large" />

        {/* Seção 2: Canais para assistir */}
        <ChannelRow
          channels={mockChannels}
          title="Canais Para Assistir"
          titleIcon={<Tv size={20} className="text-white" />}
        />

        {/* Seção 3: Mais vídeos (medium, 4 por linha) */}
        <VideoGrid videos={mediumVideos} size="medium" />
      </div>
    </AppShell>
  )
}
