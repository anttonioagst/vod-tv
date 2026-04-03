import { Star } from 'lucide-react'
import SvgIcon from '@/components/ui/SvgIcon'

interface PaywallCardProps {
  channelName: string
  className?: string
}

export default function PaywallCard({ channelName, className }: PaywallCardProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 w-full px-4${className ? ` ${className}` : ''}`}>

      {/* Ícone cadeado */}
      <div className="bg-accent/5 rounded-[100px] w-[65px] h-[64px]
                      flex items-center justify-center">
        <SvgIcon src="/icons/lock.svg" size={32} className="text-accent" />
      </div>

      {/* Textos */}
      <div className="flex flex-col items-center">
        <p className="font-primary font-semibold text-[24px] text-primary text-center pb-[8px]">
          Conteúdo exclusivo para assinantes
        </p>
        <p className="font-primary font-medium text-[16px] text-muted text-center">
          Assine este canal para assistir este vídeo e acessar conteúdo exclusivo
        </p>
      </div>

      {/* Cards de preço */}
      <div className="flex gap-3 items-start justify-center pt-2 w-full max-w-[600px]">

        {/* Card Individual */}
        <div className="bg-surface-secondary/20 border border-vod rounded-lg
                        p-4 flex flex-col items-start flex-1">
          <div className="bg-vod/60 px-[10px] py-[2px] rounded-lg mb-2">
            <span className="font-primary font-medium text-[14px] text-primary">individual</span>
          </div>
          <p className="font-primary font-medium text-[12px] text-muted mb-3">
            Acesso exclusivo ao conteúdo de @{channelName}
          </p>
          <div className="flex items-baseline mb-3">
            <span className="font-primary font-semibold text-[24px] text-primary">R$ 9,90</span>
            <span className="font-primary font-medium text-[12px] text-muted ml-1 pt-2">/mês</span>
          </div>
          <button className="bg-accent text-accent-fg px-4 py-[10px] rounded-sm
                             w-full flex items-center justify-center gap-2
                             hover:opacity-90 transition-opacity duration-150 ease-out
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
            <Star size={16} />
            <span className="font-primary font-bold text-[14px]">Assinar</span>
          </button>
        </div>

        {/* Card Global Pass — Recomendado */}
        <div className="bg-accent/5 border border-accent rounded-lg
                        p-4 flex flex-col items-start flex-1">
          <div className="flex gap-2 items-center mb-2">
            <div className="bg-accent px-[10px] py-[2px] rounded-lg
                            flex items-center gap-1">
              <Star size={12} className="text-accent-fg" />
              <span className="font-primary font-medium text-[14px] text-accent-fg">global</span>
            </div>
            <div className="bg-accent/5 px-[10px] py-1 rounded-lg">
              <span className="font-primary font-medium text-[10px] text-accent">RECOMENDADO</span>
            </div>
          </div>
          <p className="font-primary font-medium text-[12px] text-muted mb-3">
            Acesse todos os canais da plataforma
          </p>
          <div className="flex items-baseline mb-3">
            <span className="font-primary font-semibold text-[24px] text-primary">R$ 19,90</span>
            <span className="font-primary font-medium text-[12px] text-muted ml-1 pt-2">/mês</span>
          </div>
          <button className="bg-accent text-accent-fg px-4 py-[10px] rounded-sm
                             w-full flex items-center justify-center
                             hover:opacity-90 transition-opacity duration-150 ease-out
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
            <span className="font-primary font-bold text-[14px]">Assinar global</span>
          </button>
        </div>

      </div>
    </div>
  )
}
