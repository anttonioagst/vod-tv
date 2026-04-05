import Image from 'next/image'
import Link from 'next/link'
import { Radio } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import LiveBadge from '@/components/video/LiveBadge'
import { getLivesWithChannels, type LiveWithChannel } from '@/lib/supabase/queries/lives'

function LiveCard({ live }: { live: LiveWithChannel }) {
  return (
    <Link
      href={`/channel/${live.channelSlug}`}
      className="flex flex-col gap-[10px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:rounded-lg"
    >
      {/* Thumbnail placeholder com avatar centralizado */}
      <div className="relative w-[507px] h-[285px] rounded-lg overflow-hidden bg-surface-card shrink-0">
        {/* Avatar grande centralizado */}
        {live.channelAvatar ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-vod">
              <Image
                src={live.channelAvatar}
                alt={live.channelName}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-surface-elevated" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge AO VIVO */}
        <div className="absolute top-[10px] left-[10px]">
          <LiveBadge />
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-[10px]">
        <div className="relative w-[37px] h-[37px] rounded-lg overflow-hidden shrink-0">
          {live.channelAvatar ? (
            <Image
              src={live.channelAvatar}
              alt={live.channelName}
              fill
              className="object-cover"
              sizes="37px"
            />
          ) : (
            <div className="w-full h-full bg-surface-elevated" />
          )}
        </div>

        <div className="flex flex-col gap-[4px] justify-center h-[37px] overflow-hidden flex-1 min-w-0">
          <p className="font-bold text-base text-white leading-none line-clamp-1">
            {live.streamTitle ?? `${live.channelName} ao vivo`}
          </p>
          <p className="font-bold text-sm text-muted leading-none font-secondary">
            {live.channelName}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default async function LivesPage() {
  const lives = await getLivesWithChannels()

  return (
    <div className="p-4">
      <PageHeader
        icon={<Radio size={20} />}
        title="Ao Vivo"
        subtitle={
          lives.length > 0
            ? `${lives.length} canal${lives.length > 1 ? 'is' : ''} transmitindo agora`
            : 'Nenhuma live no momento'
        }
      />

      {lives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-card flex items-center justify-center">
            <Radio size={20} className="text-muted" />
          </div>
          <p className="text-base text-white font-medium">Nenhuma live ao vivo</p>
          <p className="text-sm text-muted font-secondary">
            Quando um canal começar a transmitir, aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-[56px] gap-y-8">
          {lives.map((live) => (
            <LiveCard key={live.sessionId} live={live} />
          ))}
        </div>
      )}
    </div>
  )
}
