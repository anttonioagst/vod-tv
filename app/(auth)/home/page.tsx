import AppShell from '@/components/layout/AppShell'
import VideoGrid from '@/components/video/VideoGrid'
import ChannelRow from '@/components/channel/ChannelRow'
import { Tv } from 'lucide-react'
import { mockVideos, mockChannels } from '@/lib/mock-data'

const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }

export default function AuthHomePage() {
  const largeVideos = mockVideos.slice(0, 3)
  const mediumVideos = mockVideos.slice(3)

  return (
    <AppShell isLoggedIn={true} activePath="/home" user={mockUser}>
      <div className="p-[16px]">
        <VideoGrid videos={largeVideos} size="large" />
        <ChannelRow
          channels={mockChannels}
          title="Canais Para Assistir"
          titleIcon={<Tv size={20} className="text-white" />}
        />
        <VideoGrid videos={mediumVideos} size="medium" />
      </div>
    </AppShell>
  )
}
