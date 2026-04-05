import { getAppToken, twitchHeaders } from './auth.js'
import { config } from '../config.js'
import { updateLiveSessionWebhookId, type CreatorChannelRow } from '../supabase.js'

const EVENTSUB_URL = 'https://api.twitch.tv/helix/eventsub/subscriptions'
const EVENT_TYPES = ['stream.online', 'stream.offline'] as const

type EventSubSubscription = {
  id: string
  type: string
  status: string
  condition: { broadcaster_user_id: string }
  transport: { callback: string }
}

type ListResponse = {
  data: EventSubSubscription[]
}

async function listSubscriptions(): Promise<EventSubSubscription[]> {
  const token = await getAppToken()
  const res = await fetch(`${EVENTSUB_URL}?status=enabled`, {
    headers: twitchHeaders(token),
  })
  if (!res.ok) throw new Error(`listSubscriptions error: ${res.status}`)
  const body = (await res.json()) as ListResponse
  return body.data
}

async function createSubscription(
  type: string,
  broadcasterId: string,
  callbackUrl: string
): Promise<string> {
  const token = await getAppToken()

  const res = await fetch(EVENTSUB_URL, {
    method: 'POST',
    headers: twitchHeaders(token),
    body: JSON.stringify({
      type,
      version: '1',
      condition: { broadcaster_user_id: broadcasterId },
      transport: {
        method: 'webhook',
        callback: callbackUrl,
        secret: config.twitch.webhookSecret,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`createSubscription(${type}) error: ${res.status} ${text}`)
  }

  const body = (await res.json()) as { data: [{ id: string }] }
  return body.data[0].id
}

async function deleteSubscription(id: string): Promise<void> {
  const token = await getAppToken()
  await fetch(`${EVENTSUB_URL}?id=${id}`, {
    method: 'DELETE',
    headers: twitchHeaders(token),
  })
}

/**
 * Garante que cada canal em `creator_channels` tem subscriptions
 * stream.online + stream.offline apontando para o webhook do Next.js app.
 *
 * - Subscriptions existentes e válidas: mantidas
 * - Subscriptions ausentes: criadas
 * - Subscriptions de canais removidos: deletadas
 */
export async function syncSubscriptions(channels: CreatorChannelRow[]): Promise<void> {
  const callbackUrl = `${config.app.nextAppUrl}/api/webhooks/twitch`
  const existing = await listSubscriptions()

  const activeIds = new Set(channels.map((c) => c.platform_user_id))

  // Deletar subscriptions de canais que não estão mais ativos
  for (const sub of existing) {
    if (!activeIds.has(sub.condition.broadcaster_user_id)) {
      console.log(`[subscriptions] removendo subscription obsoleta: ${sub.id} (${sub.type})`)
      await deleteSubscription(sub.id)
    }
  }

  // Para cada canal ativo, garantir que ambas as subscriptions existem
  for (const channel of channels) {
    for (const eventType of EVENT_TYPES) {
      const alreadyExists = existing.some(
        (s) =>
          s.type === eventType &&
          s.condition.broadcaster_user_id === channel.platform_user_id &&
          s.transport.callback === callbackUrl
      )

      if (alreadyExists) continue

      console.log(
        `[subscriptions] criando ${eventType} para ${channel.platform_username} (${channel.platform_user_id})`
      )

      try {
        const subId = await createSubscription(eventType, channel.platform_user_id, callbackUrl)

        // Salva o ID da subscription stream.online no banco (referência para diagnóstico)
        if (eventType === 'stream.online') {
          await updateLiveSessionWebhookId(channel.channel_id, subId)
        }

        console.log(`[subscriptions] criada: ${subId}`)
      } catch (err) {
        console.error(`[subscriptions] erro ao criar ${eventType} para ${channel.platform_username}:`, err)
      }
    }
  }

  console.log(`[subscriptions] sync concluído — ${channels.length} canais monitorados`)
}
