import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import ChannelListItem from '@/components/channel/ChannelListItem'
import { Tv } from 'lucide-react'
import { mockChannels } from '@/lib/mock-data'

export default function ChannelsPage() {
  return (
    <AppShell isLoggedIn={false} activePath="/channels">
      <div className="p-[16px]">
        <PageHeader
          icon={<Tv size={24} />}
          title="Todos os Canais"
          subtitle="Encontre e siga seus criadores favoritos"
        />
        <div className="flex flex-col">
          {mockChannels.map((channel) => (
            <ChannelListItem key={channel.id} channel={channel} />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
