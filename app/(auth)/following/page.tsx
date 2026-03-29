import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import ChannelRow from '@/components/channel/ChannelRow'
import { Heart } from 'lucide-react'
import { getFollowing } from '@/lib/supabase/queries/user-data'

export default async function FollowingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const channels = await getFollowing(user.id)

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Heart size={24} />}
        title="Seguindo"
        subtitle="Canais que você segue"
      />
      {channels.length > 0 ? (
        <ChannelRow
          channels={channels}
          title="Canais que Você Segue"
          titleIcon={<Heart size={20} className="text-white" />}
        />
      ) : (
        <EmptyState
          icon={<Heart size={48} />}
          title="Você não segue nenhum canal"
          subtitle="Canais que você segue aparecerão aqui"
        />
      )}
    </div>
  )
}
