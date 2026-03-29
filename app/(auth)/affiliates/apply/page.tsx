import PageHeader from '@/components/ui/PageHeader'
import { Link2 } from 'lucide-react'
import { submitAffiliateApplication } from '@/lib/supabase/queries/affiliates'

const inputClass =
  'bg-surface-secondary border border-vod rounded-sm px-3 py-2 text-primary w-full outline-none focus:border-accent transition-colors'

export default function AffiliatesApplyPage() {
  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Link2 size={24} />}
        title="Aplicar como Afiliado"
        subtitle="Preencha o formulário para se candidatar"
      />
      <form action={submitAffiliateApplication} className="max-w-[600px] flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Nome do canal</label>
          <input type="text" name="channel_name" placeholder="Seu canal" className={inputClass} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Link do canal</label>
          <input type="url" name="social_links" placeholder="https://vod.tv/canal" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Por que deseja ser afiliado?</label>
          <textarea
            rows={4}
            name="message"
            placeholder="Conte um pouco sobre você e seus objetivos..."
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="bg-accent text-accent-fg rounded-sm px-4 py-2 font-medium text-base w-full"
        >
          Enviar candidatura
        </button>
      </form>
    </div>
  )
}
