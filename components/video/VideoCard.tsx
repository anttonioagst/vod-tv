import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Video } from '@/lib/types'
import LiveBadge from '@/components/video/LiveBadge'

interface VideoCardProps {
  video: Video
  size?: 'large' | 'medium'
  isLive?: boolean
  className?: string
}

export default function VideoCard({ video, size = 'large', isLive = false, className }: VideoCardProps) {
  const isLarge = size === 'large'

  return (
    <Link
      href={`/watch/${video.id}`}
      className={`flex flex-col gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:rounded-lg${className ? ` ${className}` : ''}`}
    >
      {/* Thumbnail */}
      <div
        className={`relative rounded-lg overflow-hidden shrink-0 ${isLarge ? 'w-video-lg h-thumb-lg' : 'w-video-md h-thumb-md'}`}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 group-hover:brightness-75 transition-all duration-200 ease-out"
          sizes={isLarge ? '507px' : '376px'}
        />

        {/* Badge superior esquerdo — AO VIVO > Exclusivo > Grátis */}
        {isLive ? (
          <div className="absolute top-2.5 left-2.5">
            <LiveBadge />
          </div>
        ) : video.isExclusive ? (
          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm border border-accent/30 flex items-center gap-[3px] px-[6px] py-[3px] rounded-xs">
            <Lock size={10} className="text-accent" />
            <span className="font-bold text-2xs text-accent font-secondary tracking-wide">
              EXCLUSIVO
            </span>
          </div>
        ) : (
          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm border border-green-500/30 px-[6px] py-[3px] rounded-xs">
            <span className="font-bold text-2xs text-green-400 font-secondary tracking-wide">
              GRÁTIS
            </span>
          </div>
        )}

        {/* Badge duração — canto inferior direito */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm px-[6px] py-[3px] rounded-xs">
          <span className="font-bold text-xs text-white tabular-nums">
            {video.duration}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2.5">
        {/* Avatar canal */}
        <div className="relative w-[37px] h-[37px] rounded-full overflow-hidden shrink-0 mt-0.5">
          <Image
            src={video.channelAvatar}
            alt={video.channelName}
            fill
            className="object-cover"
            sizes="37px"
          />
        </div>

        {/* Título + Canal */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="font-bold text-base text-white leading-snug line-clamp-2">
            {video.title}
          </p>
          <p className="font-medium text-sm text-muted font-secondary leading-none">
            {video.channelName}
          </p>
        </div>
      </div>
    </Link>
  )
}
