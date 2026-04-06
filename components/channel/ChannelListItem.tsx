import Image from 'next/image'
import Link from 'next/link'
import { Channel } from '@/lib/types'
import FollowButton from '@/components/channel/FollowButton'

interface ChannelListItemProps {
  channel: Channel
  isLoggedIn?: boolean
}

export default function ChannelListItem({ channel, isLoggedIn = false }: ChannelListItemProps) {
  const slug = channel.username.replace('@', '')

  return (
    <div className="flex items-center justify-between border-b border-vod py-4 px-6 w-full">
      {/* Esquerda: avatar + info */}
      <Link
        href={`/channel/${slug}`}
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

      {/* Direita: botão seguir funcional */}
      <FollowButton
        channelId={channel.id}
        channelSlug={slug}
        initialIsFollowing={channel.isFollowing ?? false}
        isLoggedIn={isLoggedIn}
      />
    </div>
  )
}
