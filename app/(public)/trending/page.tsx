import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import VideoGrid from '@/components/video/VideoGrid'
import { TrendingUp } from 'lucide-react'
import { mockVideos } from '@/lib/mock-data'

export default function TrendingPage() {
  const trendingVideos = [...mockVideos, ...mockVideos]
    .slice(0, 12)
    .map((v, i) => ({ ...v, id: `trending-${i}` }))

  return (
    <AppShell isLoggedIn={false} activePath="/trending">
      <div className="p-[16px]">
        <PageHeader
          icon={<TrendingUp size={24} />}
          title="Em Alta"
          subtitle="Os Vídeos mais assistidos e curtidos recentemente"
        />
        <VideoGrid videos={trendingVideos} size="medium" />
      </div>
    </AppShell>
  )
}
