'use client'

import { useState, useTransition } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { Link2 } from 'lucide-react'
import { submitAffiliateApplication } from '@/lib/supabase/queries/affiliates'

const inputClass =
  'bg-surface-secondary border border-vod rounded-sm px-3 py-2 text-primary w-full outline-none focus:border-accent transition-colors'
const inputErrorClass =
  'bg-surface-secondary border border-red-500 rounded-sm px-3 py-2 text-primary w-full outline-none focus:border-red-400 transition-colors'

interface FieldErrors {
  channel_name?: string
  message?: string
}

function validateField(name: string, value: string): string | undefined {
  if (name === 'channel_name') {
    if (!value.trim()) return 'Nome do canal é obrigatório'
    if (value.trim().length < 3) return 'Nome do canal deve ter pelo menos 3 caracteres'
  }
  if (name === 'message') {
    if (!value.trim()) return 'Mensagem é obrigatória'
    if (value.trim().length < 20) return 'Mensagem deve ter pelo menos 20 caracteres'
  }
  return undefined
}

export default function AffiliatesApplyPage() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const err = validateField(name, value)
    setFieldErrors(prev => ({ ...prev, [name]: err }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name } = e.target
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const channelName = data.get('channel_name') as string
    const message = data.get('message') as string

    const errors: FieldErrors = {}
    const channelErr = validateField('channel_name', channelName)
    if (channelErr) errors.channel_name = channelErr
    const messageErr = validateField('message', message)
    if (messageErr) errors.message = messageErr

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitError(null)
    startTransition(async () => {
      const result = await submitAffiliateApplication(data)
      if (!result) {
        setSuccess(true)
      } else if (result.error === 'already_applied') {
        setSubmitError('Você já enviou uma candidatura.')
      } else {
        setSubmitError('Erro ao enviar candidatura. Tente novamente.')
      }
    })
  }

  if (success) {
    return (
      <div className="p-[16px]">
        <PageHeader
          icon={<Link2 size={24} />}
          title="Aplicar como Afiliado"
          subtitle="Preencha o formulário para se candidatar"
        />
        <div className="max-w-[600px] bg-green-500/[0.08] border border-green-500/25 rounded-lg p-6 text-center">
          <p className="text-green-400 font-semibold text-base">Candidatura enviada com sucesso!</p>
          <p className="text-secondary text-base mt-2">Entraremos em contato em breve.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-[16px]">
      <PageHeader
        icon={<Link2 size={24} />}
        title="Aplicar como Afiliado"
        subtitle="Preencha o formulário para se candidatar"
      />
      <form onSubmit={handleSubmit} className="max-w-[600px] flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Nome do canal</label>
          <input
            type="text"
            name="channel_name"
            placeholder="Seu canal"
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={isPending}
            className={fieldErrors.channel_name ? inputErrorClass : inputClass}
          />
          {fieldErrors.channel_name && (
            <span className="text-red-300 text-sm">{fieldErrors.channel_name}</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Link do canal</label>
          <input
            type="url"
            name="social_links"
            placeholder="https://vod.tv/canal"
            disabled={isPending}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-secondary font-medium">Por que deseja ser afiliado?</label>
          <textarea
            rows={4}
            name="message"
            placeholder="Conte um pouco sobre você e seus objetivos..."
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={isPending}
            className={fieldErrors.message ? inputErrorClass : inputClass}
          />
          {fieldErrors.message && (
            <span className="text-red-300 text-sm">{fieldErrors.message}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-accent-fg rounded-sm px-4 py-3 font-bold text-base w-full flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-accent-fg/40 border-t-accent-fg rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar Candidatura'
          )}
        </button>
        {submitError && (
          <p className="text-red-300 text-sm text-center">{submitError}</p>
        )}
      </form>
    </div>
  )
}
