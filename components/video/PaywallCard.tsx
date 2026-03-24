import { Star, Lock } from 'lucide-react'

interface PaywallCardProps {
  channelName: string
}

export default function PaywallCard({ channelName }: PaywallCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full px-4">

      {/* Ícone cadeado */}
      <div className="bg-[rgba(253,255,121,0.05)] rounded-[100px] w-[65px] h-[64px]
                      flex items-center justify-center">
        <Lock size={32} className="text-[#fdff79]" />
      </div>

      {/* Textos */}
      <div className="flex flex-col items-center">
        <p className="font-geist font-semibold text-[24px] text-white text-center pb-[8px]">
          Conteúdo exclusivo para assinantes
        </p>
        <p className="font-geist font-medium text-[16px] text-[#737373] text-center">
          Assine este canal para assistir este vídeo e acessar conteúdo exclusivo
        </p>
      </div>

      {/* Cards de preço */}
      <div className="flex gap-3 items-start justify-center pt-2 w-full max-w-[600px]">

        {/* Card Individual */}
        <div className="bg-[rgba(25,25,25,0.2)] border border-[#3e3e3e] rounded-[10px]
                        p-4 flex flex-col items-start flex-1">
          <div className="bg-[rgba(62,62,62,0.6)] px-[10px] py-[2px] rounded-[10px] mb-2">
            <span className="font-geist font-medium text-[14px] text-white">individual</span>
          </div>
          <p className="font-geist font-medium text-[12px] text-[#737373] mb-3">
            Acesso exclusivo ao conteúdo de @{channelName}
          </p>
          <div className="flex items-baseline mb-3">
            <span className="font-geist font-semibold text-[24px] text-white">R$ 9,90</span>
            <span className="font-geist font-medium text-[12px] text-[#737373] ml-1 pt-2">/mês</span>
          </div>
          <button className="bg-[#fdff79] text-[#0c0c0c] px-4 py-[10px] rounded-[6px]
                             w-full flex items-center justify-center gap-2
                             hover:bg-[#e8ea60] transition-colors">
            <Star size={16} />
            <span className="font-geist font-bold text-[14px]">Assinar</span>
          </button>
        </div>

        {/* Card Global Pass — Recomendado */}
        <div className="bg-[rgba(253,255,121,0.05)] border border-[#fdff79] rounded-[10px]
                        p-4 flex flex-col items-start flex-1">
          <div className="flex gap-2 items-center mb-2">
            <div className="bg-[#fdff79] px-[10px] py-[2px] rounded-[10px]
                            flex items-center gap-1">
              <Star size={12} className="text-black" />
              <span className="font-geist font-medium text-[14px] text-black">individual</span>
            </div>
            <div className="bg-[rgba(253,255,121,0.05)] px-[10px] py-1 rounded-[10px]">
              <span className="font-geist font-medium text-[10px] text-[#fdff79]">RECOMENDADO</span>
            </div>
          </div>
          <p className="font-geist font-medium text-[12px] text-[#737373] mb-3">
            Acesse todos os canais da plataforma
          </p>
          <div className="flex items-baseline mb-3">
            <span className="font-geist font-semibold text-[24px] text-white">R$ 19,90</span>
            <span className="font-geist font-medium text-[12px] text-[#737373] ml-1 pt-2">/mês</span>
          </div>
          <button className="bg-[#fdff79] text-[#0c0c0c] px-4 py-[10px] rounded-[6px]
                             w-full flex items-center justify-center
                             hover:bg-[#e8ea60] transition-colors">
            <span className="font-geist font-bold text-[14px]">Assinar global</span>
          </button>
        </div>

      </div>
    </div>
  )
}
