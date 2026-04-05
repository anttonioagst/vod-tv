import { config } from '../config.js'

type AppToken = {
  access_token: string
  expires_at: number // epoch ms
}

let cached: AppToken | null = null

/**
 * Retorna um app access token válido (Client Credentials flow).
 * Renova automaticamente quando próximo de expirar.
 */
export async function getAppToken(): Promise<string> {
  const now = Date.now()

  if (cached && cached.expires_at > now + 60_000) {
    return cached.access_token
  }

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.twitch.clientId,
      client_secret: config.twitch.clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  if (!res.ok) {
    throw new Error(`Twitch token error: ${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }

  cached = {
    access_token: data.access_token,
    expires_at: now + data.expires_in * 1000,
  }

  return cached.access_token
}

export function twitchHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Client-Id': config.twitch.clientId,
    'Content-Type': 'application/json',
  }
}
