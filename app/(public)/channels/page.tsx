import PageHeader from '@/components/ui/PageHeader'
import ChannelListItem from '@/components/channel/ChannelListItem'
import { Tv } from 'lucide-react'
import { getAllChannels } from '@/lib/supabase/queries/channels'

export default async function ChannelsPage() {
  const channels = await getAllChannels()

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Tv size={24} />}
        title="Todos os Canais"
        subtitle="Encontre e siga seus criadores favoritos"
      />
      <div className="flex flex-col">
        {channels.map((channel) => (
          <ChannelListItem key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  )
}
