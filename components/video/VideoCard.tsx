import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Video } from '@/lib/types'

interface VideoCardProps {
  video: Video
  size?: 'large' | 'medium'
  className?: string
}

export default function VideoCard({ video, size = 'large', className }: VideoCardProps) {
  const isLarge = size === 'large'

  return (
    <Link
      href={`/watch/${video.id}`}
      className={`flex flex-col gap-[10px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:rounded-lg${className ? ` ${className}` : ''}`}
    >
      {/* Thumbnail */}
      <div
        className={`relative rounded-lg overflow-clip shrink-0 ${isLarge ? 'w-video-lg h-thumb-lg' : 'w-video-md h-thumb-md'}`}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-150 ease-out"
          sizes={isLarge ? '507px' : '376px'}
        />

        {/* Badge Exclusivo */}
        {video.isExclusive && (
          <div className="absolute top-[10px] left-[10px] bg-vod flex items-center gap-[2px] px-[5px] py-[3px] rounded-xs">
            <Lock size={12} className="text-accent" />
            <span className="font-bold text-2xs text-accent font-secondary">
              Exclusivo
            </span>
          </div>
        )}

        {/* Badge Duração */}
        <div className="absolute bottom-[10px] right-[10px] bg-vod px-[5px] py-[3px] rounded-xs">
          <span className="font-bold text-xs text-white">
            {video.duration}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-[10px]">
        {/* Avatar canal */}
        <div className="relative w-[37px] h-[37px] rounded-lg overflow-hidden shrink-0">
          <Image
            src={video.channelAvatar}
            alt={video.channelName}
            fill
            className="object-cover"
            sizes="37px"
          />
        </div>

        {/* Título + Canal */}
        <div className="flex flex-col gap-[4px] justify-center h-[37px] overflow-hidden flex-1 min-w-0">
          <p className="font-bold text-base text-white leading-none line-clamp-1">
            {video.title}
          </p>
          <p className="font-bold text-sm text-muted leading-none font-secondary">
            {video.channelName}
          </p>
        </div>
      </div>
    </Link>
  )
}
