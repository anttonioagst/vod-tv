import PageHeader from '@/components/ui/PageHeader'
import VideoGrid from '@/components/video/VideoGrid'
import { TrendingUp } from 'lucide-react'
import { getTrendingVideos } from '@/lib/supabase/queries/videos'

export default async function TrendingPage() {
  const videos = await getTrendingVideos()

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<TrendingUp size={24} />}
        title="Em Alta"
        subtitle="Os Vídeos mais assistidos e curtidos recentemente"
      />
      <VideoGrid videos={videos} size="medium" />
    </div>
  )
}
