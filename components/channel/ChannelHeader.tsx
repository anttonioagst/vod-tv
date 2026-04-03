'use client'
import Image from 'next/image'
import { Star, Heart } from 'lucide-react'
import { Channel } from '@/lib/types'

interface ChannelHeaderProps {
  channel: Channel
  bannerUrl?: string
}

export default function ChannelHeader({ channel, bannerUrl }: ChannelHeaderProps) {
  return (
    <div className="flex flex-col">

      {/* Banner */}
      <div className="relative w-full h-[224px] rounded-lg overflow-hidden bg-surface-secondary">
        {bannerUrl && (
          <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
        )}
      </div>

      {/* Perfil — relativo ao banner para o avatar flutuar */}
      <div className="flex items-start gap-0 py-4 relative">

        {/* Avatar flutuante */}
        <div className="absolute -top-[48px] left-0 w-[160px] h-[160px]
                        rounded-lg overflow-hidden border-4 border-surface
                        shrink-0">
          <Image
            src={channel.avatar}
            alt={channel.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Spacer para empurrar o conteúdo para direita do avatar */}
        <div className="w-[160px] shrink-0" />

        {/* Info + ações */}
        <div className="flex flex-col gap-[10px] p-[10px]">
          <p className="font-primary font-bold text-[30px] text-primary leading-none">
            {channel.name}
          </p>
          <div className="flex items-center gap-1">
            <span className="font-primary font-medium text-[14px] text-muted">
              {channel.username}
            </span>
            <div className="w-[3px] h-[3px] rounded-full bg-muted" />
            <span className="font-primary font-medium text-[14px] text-muted">
              {channel.videoCount} vídeos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-accent text-accent-fg rounded-sm
                               px-4 py-[10px] flex items-center gap-2
                               hover:opacity-90 transition-opacity duration-150 ease-out
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
              <Star size={16} />
              <span className="font-primary font-bold text-[14px]">Assinar</span>
            </button>
            <button className="bg-surface-secondary border border-vod rounded-sm
                               size-[36px] flex items-center justify-center
                               hover:border-accent transition-colors duration-150 ease-out
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
              <Heart size={20} className="text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
