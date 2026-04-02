import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Gift } from 'lucide-react'
import { getReferrals } from '@/lib/supabase/queries/user-data'

type Referral = { id: string; referred_id: string; status: string }

export default async function ReferralsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const referrals = await getReferrals(user.id)

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Gift size={24} />}
        title="Indicações"
        subtitle="Convide amigos e ganhe recompensas"
      />
      {referrals.length > 0 ? (
        <div className="flex flex-col gap-3 mt-4">
          {referrals.map((referral: Referral) => (
            <div
              key={referral.id}
              className="bg-surface-card border border-vod rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <span className="text-secondary text-base">Indicação {referral.referred_id.slice(0, 8)}...</span>
              <span className={`text-sm rounded-xs px-2 py-0.5 ${
                referral.status === 'active'
                  ? 'bg-green-900/40 text-green-400'
                  : referral.status === 'expired'
                  ? 'bg-red-900/40 text-red-400'
                  : 'bg-vod text-secondary'
              }`}>
                {referral.status === 'active' ? 'Ativo' : referral.status === 'expired' ? 'Expirado' : 'Pendente'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Gift size={48} />}
          title="Nenhuma indicação ainda"
          subtitle="Suas indicações aparecerão aqui"
        />
      )}
    </div>
  )
}
