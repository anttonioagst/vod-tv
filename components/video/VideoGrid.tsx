import { Video } from '@/lib/types'
import VideoCard from './VideoCard'

interface VideoGridProps {
  videos: Video[]
  size?: 'large' | 'medium'
  title?: string
  titleIcon?: React.ReactNode
}

export default function VideoGrid({
  videos,
  size = 'large',
  title,
  titleIcon,
}: VideoGridProps) {
  return (
    <div className="flex flex-col gap-0 pb-[40px]">
      {title && (
        <div className="flex items-center gap-[10px] pb-[18px] px-[4px]">
          {titleIcon}
          <p className="font-semibold text-lg text-white">{title}</p>
        </div>
      )}
      <div className="flex items-start justify-between flex-wrap gap-y-[24px]">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} size={size} />
        ))}
      </div>
    </div>
  )
}
