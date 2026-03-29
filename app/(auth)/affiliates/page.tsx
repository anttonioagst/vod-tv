import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Link2 } from 'lucide-react'
import { getAffiliateApplication } from '@/lib/supabase/queries/affiliates'

export default async function AffiliatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const application = await getAffiliateApplication(user.id)

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Link2 size={24} />}
        title="Afiliados"
        subtitle="Programa de afiliados Vod.TV"
      />
      {application === null && (
        <>
          <EmptyState
            icon={<Link2 size={48} />}
            title="Programa de afiliados"
            subtitle="Você ainda não é afiliado"
          />
          <div className="flex justify-center mt-2">
            <Link
              href="/affiliates/apply"
              className="bg-accent text-accent-fg rounded-sm px-4 py-2 font-medium text-base"
            >
              Aplicar como afiliado
            </Link>
          </div>
        </>
      )}
      {application?.status === 'pending' && (
        <div className="mt-6 bg-surface-card border border-vod rounded-lg px-6 py-5 max-w-[500px]">
          <p className="text-primary font-medium text-base mb-1">Candidatura em análise</p>
          <p className="text-secondary text-sm">Sua candidatura está sendo revisada pela equipe Vod.TV. Você será notificado quando houver uma decisão.</p>
        </div>
      )}
      {application?.status === 'approved' && (
        <div className="mt-6 bg-surface-card border border-vod rounded-lg px-6 py-5 max-w-[500px]">
          <p className="text-primary font-medium text-base mb-1">Você é um afiliado!</p>
          <p className="text-secondary text-sm">Parabéns! Sua candidatura foi aprovada. Bem-vindo ao programa de afiliados Vod.TV.</p>
        </div>
      )}
      {application?.status === 'rejected' && (
        <div className="mt-6 bg-surface-card border border-vod rounded-lg px-6 py-5 max-w-[500px]">
          <p className="text-primary font-medium text-base mb-1">Candidatura não aprovada</p>
          <p className="text-secondary text-sm">Infelizmente sua candidatura não foi aprovada desta vez. Tente novamente mais tarde.</p>
        </div>
      )}
    </div>
  )
}
