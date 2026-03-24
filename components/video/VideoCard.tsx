import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Video } from '@/lib/types'

interface VideoCardProps {
  video: Video
  size?: 'large' | 'medium'
}

export default function VideoCard({ video, size = 'large' }: VideoCardProps) {
  const thumbW = size === 'large' ? 507 : 376
  const thumbH = size === 'large' ? 285 : 211

  return (
    <Link href={`/watch/${video.id}`} className="flex flex-col gap-[10px] group">
      {/* Thumbnail */}
      <div
        className="relative rounded-lg overflow-hidden shrink-0"
        style={{ width: thumbW, height: thumbH }}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes={`${thumbW}px`}
        />

        {/* Badge Exclusivo */}
        {video.isExclusive && (
          <div className="absolute top-[10px] left-[10px] bg-vod flex items-center gap-[2px] px-[5px] py-[3px] rounded-xs">
            <Lock size={12} className="text-accent" />
            <span
              className="font-bold text-2xs text-accent"
              style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
            >
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
        <div className="flex flex-col gap-[4px] justify-center h-[37px] overflow-hidden">
          <p className="font-bold text-base text-white leading-none line-clamp-1">
            {video.title}
          </p>
          <p
            className="font-bold text-sm text-muted leading-none"
            style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
          >
            {video.channelName}
          </p>
        </div>
      </div>
    </Link>
  )
}
