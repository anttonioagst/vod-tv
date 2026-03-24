import Image from 'next/image'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { Channel } from '@/lib/types'

interface ChannelListItemProps {
  channel: Channel
}

export default function ChannelListItem({ channel }: ChannelListItemProps) {
  return (
    <div className="flex items-center justify-between border-b border-vod py-4 px-6 w-full">
      {/* Esquerda: avatar + info */}
      <Link
        href={`/channel/${channel.username.replace('@', '')}`}
        className="flex items-center gap-4 group"
      >
        <div className="relative w-[110px] h-[110px] rounded-lg overflow-hidden shrink-0">
          <Image
            src={channel.avatar}
            alt={channel.name}
            fill
            className="object-cover"
            sizes="110px"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-bold text-[26px] text-white group-hover:text-accent transition-colors">
            {channel.name}
          </p>
          <p
            className="text-lg text-muted"
            style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
          >
            {channel.username}
          </p>
          <span
            className="text-lg text-muted"
            style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
          >
            {channel.description}
          </span>
        </div>
      </Link>

      {/* Direita: botão seguir */}
      <button className="flex items-center gap-2 border border-vod rounded-lg px-3 py-[9px] text-white hover:border-accent hover:text-accent transition-colors shrink-0">
        <UserPlus size={16} />
        <span className="font-medium text-base">Seguir</span>
      </button>
    </div>
  )
}
