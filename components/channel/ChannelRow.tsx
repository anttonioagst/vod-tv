import { Channel } from '@/lib/types'
import ChannelCard from './ChannelCard'

interface ChannelRowProps {
  channels: Channel[]
  title?: string
  titleIcon?: React.ReactNode
}

export default function ChannelRow({
  channels,
  title,
  titleIcon,
}: ChannelRowProps) {
  return (
    <div className="flex flex-col gap-0 pb-[40px]">
      {title && (
        <div className="flex items-center gap-[10px] pb-[18px] px-[4px]">
          {titleIcon}
          <p className="font-semibold text-lg text-white">{title}</p>
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-y-[16px]">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  )
}
