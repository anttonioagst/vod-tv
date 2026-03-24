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
      <div className="relative w-full h-[224px] rounded-[10px] overflow-hidden bg-[#191919]">
        {bannerUrl && (
          <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
        )}
      </div>

      {/* Perfil — relativo ao banner para o avatar flutuar */}
      <div className="flex items-start gap-0 py-4 relative">

        {/* Avatar flutuante */}
        <div className="absolute -top-[48px] left-0 w-[160px] h-[160px]
                        rounded-[10px] overflow-hidden border-4 border-[#0c0c0c]
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
          <p className="font-geist font-bold text-[30px] text-white leading-none">
            {channel.name}
          </p>
          <div className="flex items-center gap-1">
            <span className="font-geist font-medium text-[14px] text-[#737373]">
              {channel.username}
            </span>
            <div className="w-[3px] h-[3px] rounded-full bg-[#737373]" />
            <span className="font-geist font-medium text-[14px] text-[#737373]">
              {channel.videoCount} vídeos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-[#fdff79] text-[#0c0c0c] rounded-[6px]
                               px-4 py-[10px] flex items-center gap-2
                               hover:bg-[#e8ea60] transition-colors">
              <Star size={16} />
              <span className="font-geist font-bold text-[14px]">Assinar</span>
            </button>
            <button className="bg-[#191919] border border-[#3e3e3e] rounded-[6px]
                               size-[36px] flex items-center justify-center
                               hover:border-[#fdff79] transition-colors">
              <Heart size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
