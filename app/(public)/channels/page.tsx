import PageHeader from '@/components/ui/PageHeader'
import ChannelListItem from '@/components/channel/ChannelListItem'
import { Tv } from 'lucide-react'
import { getAllChannels } from '@/lib/supabase/queries/channels'
import { createClient } from '@/lib/supabase/server'

export default async function ChannelsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const channels = await getAllChannels()

  // Busca quais canais o usuário segue para pré-popular o estado do botão
  let followedIds = new Set<string>()
  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('channel_id')
      .eq('user_id', user.id)
    followedIds = new Set((follows ?? []).map((f) => f.channel_id))
  }

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Tv size={24} />}
        title="Todos os Canais"
        subtitle="Encontre e siga seus criadores favoritos"
      />
      <div className="flex flex-col">
        {channels.map((channel) => (
          <ChannelListItem
            key={channel.id}
            channel={{ ...channel, isFollowing: followedIds.has(channel.id) }}
            isLoggedIn={!!user}
          />
        ))}
      </div>
    </div>
  )
}
