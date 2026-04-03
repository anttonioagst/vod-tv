import Image from 'next/image'
import Link from 'next/link'
import { Channel } from '@/lib/types'

interface ChannelCardProps {
  channel: Channel
  className?: string
}

export default function ChannelCard({ channel, className }: ChannelCardProps) {
  const slug = channel.username.replace('@', '')

  return (
    <Link
      href={`/channel/${slug}`}
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:rounded-lg${className ? ` ${className}` : ''}`}
    >
      <div className="bg-surface-card border border-vod rounded-lg overflow-clip flex flex-col items-center gap-[10px] px-[38px] py-[15px] w-[140px] hover:border-accent transition-colors duration-150 ease-out cursor-pointer">
        {/* Avatar */}
        <div className="relative w-[64px] h-[64px] rounded-full overflow-hidden shrink-0">
          <Image
            src={channel.avatar}
            alt={channel.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        {/* Nome + Handle */}
        <div className="flex flex-col gap-[10px] text-center w-full">
          <p className="font-bold text-base text-white font-secondary truncate">
            {channel.name}
          </p>
          <p className="font-medium text-sm text-subtle font-secondary truncate">
            {channel.username}
          </p>
        </div>
      </div>
    </Link>
  )
}
