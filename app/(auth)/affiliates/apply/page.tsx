import PageHeader from '@/components/ui/PageHeader'
import { Link2 } from 'lucide-react'

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
      <div className="max-w-[600px] flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Nome completo</label>
          <input type="text" placeholder="Seu nome" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Email</label>
          <input type="email" placeholder="seu@email.com" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Link do canal</label>
          <input type="url" placeholder="https://vod.tv/canal" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Por que deseja ser afiliado?</label>
          <textarea
            rows={4}
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
      </div>
    </div>
  )
}
