import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TWITCH_MESSAGE_ID = 'twitch-eventsub-message-id'
const TWITCH_MESSAGE_TIMESTAMP = 'twitch-eventsub-message-timestamp'
const TWITCH_MESSAGE_SIGNATURE = 'twitch-eventsub-message-signature'
const TWITCH_MESSAGE_TYPE = 'twitch-eventsub-message-type'

async function verifyTwitchSignature(
  req: NextRequest,
  rawBody: string
): Promise<boolean> {
  const secret = process.env.TWITCH_WEBHOOK_SECRET
  if (!secret) return false

  const msgId = req.headers.get(TWITCH_MESSAGE_ID) ?? ''
  const timestamp = req.headers.get(TWITCH_MESSAGE_TIMESTAMP) ?? ''
  const signature = req.headers.get(TWITCH_MESSAGE_SIGNATURE) ?? ''

  const message = msgId + timestamp + rawBody

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message)
  )

  const computed =
    'sha256=' +
    Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

  return computed === signature
}

/**
 * POST /api/webhooks/twitch
 *
 * Recebe notificações do Twitch EventSub.
 * Eventos suportados:
 *   - webhook_callback_verification → retorna o challenge
 *   - stream.online  → cria live_session com status 'recording'
 *   - stream.offline → atualiza live_session para status 'processing'
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const valid = await verifyTwitchSignature(req, rawBody)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const messageType = req.headers.get(TWITCH_MESSAGE_TYPE) ?? ''

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Verificação de callback (Twitch envia ao criar a subscription)
  if (messageType === 'webhook_callback_verification') {
    const challenge = (body as { challenge?: string }).challenge
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // Revogação de subscription — apenas loga
  if (messageType === 'revocation') {
    console.warn('[webhooks/twitch] subscription revoked:', body.subscription)
    return NextResponse.json({ ok: true })
  }

  // Notificação de evento
  if (messageType !== 'notification') {
    return NextResponse.json({ ok: true })
  }

  const subscription = body.subscription as { type?: string } | undefined
  const event = body.event as Record<string, unknown> | undefined

  if (!subscription?.type || !event) {
    return NextResponse.json({ error: 'Missing subscription or event' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // stream.online → criar live_session
  if (subscription.type === 'stream.online') {
    const broadcasterUserId = event['broadcaster_user_id'] as string
    const title = (event['title'] as string | undefined) ?? null

    // Busca o creator_channel correspondente ao broadcaster_user_id
    const { data: creatorChannel } = await supabase
      .from('creator_channels')
      .select('channel_id')
      .eq('platform', 'twitch')
      .eq('platform_user_id', broadcasterUserId)
      .maybeSingle()

    if (!creatorChannel) {
      // Canal não registrado no sistema — ignorar silenciosamente
      return NextResponse.json({ ok: true })
    }

    const { error } = await supabase.from('live_sessions').insert({
      channel_id: creatorChannel.channel_id,
      platform: 'twitch',
      stream_title: title,
      started_at: new Date().toISOString(),
      status: 'recording',
    })

    if (error) {
      console.error('[webhooks/twitch] stream.online insert error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    console.log('[webhooks/twitch] stream.online → live_session criada para channel', creatorChannel.channel_id)
    return NextResponse.json({ ok: true })
  }

  // stream.offline → marcar live_session como 'processing'
  if (subscription.type === 'stream.offline') {
    const broadcasterUserId = event['broadcaster_user_id'] as string

    const { data: creatorChannel } = await supabase
      .from('creator_channels')
      .select('channel_id')
      .eq('platform', 'twitch')
      .eq('platform_user_id', broadcasterUserId)
      .maybeSingle()

    if (!creatorChannel) {
      return NextResponse.json({ ok: true })
    }

    // Atualiza a live_session mais recente em 'recording' para 'processing'
    const { data: liveSession } = await supabase
      .from('live_sessions')
      .select('id')
      .eq('channel_id', creatorChannel.channel_id)
      .eq('status', 'recording')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (liveSession) {
      const { error } = await supabase
        .from('live_sessions')
        .update({
          status: 'processing',
          ended_at: new Date().toISOString(),
        })
        .eq('id', liveSession.id)

      if (error) {
        console.error('[webhooks/twitch] stream.offline update error:', error)
        return NextResponse.json({ error: 'DB error' }, { status: 500 })
      }

      console.log('[webhooks/twitch] stream.offline → live_session', liveSession.id, 'marcada como processing')
    }

    return NextResponse.json({ ok: true })
  }

  // Evento não tratado
  return NextResponse.json({ ok: true })
}
