import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import ChannelRow from '@/components/channel/ChannelRow'
import { Star } from 'lucide-react'
import { getSubscriptions } from '@/lib/supabase/queries/user-data'

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const channels = await getSubscriptions(user.id)

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Star size={24} />}
        title="Assinaturas"
        subtitle="Canais que você assina"
      />
      {channels.length > 0 ? (
        <ChannelRow
          channels={channels}
          title="Seus Canais Assinados"
          titleIcon={<Star size={20} className="text-white" />}
        />
      ) : (
        <EmptyState
          icon={<Star size={48} />}
          title="Nenhuma assinatura ainda"
          subtitle="Suas assinaturas aparecerão aqui"
        />
      )}
    </div>
  )
}
