'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4 p-[16px]">
      <p className="text-primary font-semibold text-lg">Canal não disponível</p>
      <p className="text-muted text-base text-center max-w-sm">
        Não foi possível carregar as informações deste canal.
      </p>
      <button
        onClick={reset}
        className="bg-accent text-accent-fg font-bold text-base px-6 py-[10px] rounded-sm hover:opacity-90 transition-opacity"
      >
        Tentar novamente
      </button>
    </div>
  )
}
