import Image from 'next/image'
import Link from 'next/link'
import { Channel } from '@/lib/types'

interface ChannelCardProps {
  channel: Channel
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const slug = channel.username.replace('@', '')

  return (
    <Link href={`/channel/${slug}`}>
      <div className="bg-surface-card border border-vod rounded-lg flex flex-col items-center gap-[10px] px-[38px] py-[15px] w-[140px] hover:border-accent transition-colors cursor-pointer">
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
          <p
            className="font-bold text-base text-white truncate"
            style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
          >
            {channel.name}
          </p>
          <p
            className="font-medium text-sm text-subtle truncate"
            style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
          >
            {channel.username}
          </p>
        </div>
      </div>
    </Link>
  )
}
