import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function isAdminAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  return req.headers.get('x-admin-secret') === secret
}

/**
 * POST /api/admin/channels
 *
 * Registra ou atualiza um canal Twitch em creator_channels.
 *
 * Body:
 * {
 *   channelId: string          // UUID do canal em channels
 *   twitchUsername: string     // username Twitch (ex: "gaules")
 *   twitchUserId: string       // user_id da API Twitch
 *   autoRecord?: boolean       // default true
 * }
 *
 * Headers:
 *   x-admin-secret: <ADMIN_SECRET>
 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    channelId?: string
    twitchUsername?: string
    twitchUserId?: string
    autoRecord?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { channelId, twitchUsername, twitchUserId, autoRecord = true } = body

  if (!channelId || !twitchUsername || !twitchUserId) {
    return NextResponse.json(
      { error: 'channelId, twitchUsername e twitchUserId são obrigatórios' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Verifica se o canal existe
  const { data: channel, error: channelError } = await supabase
    .from('channels')
    .select('id')
    .eq('id', channelId)
    .maybeSingle()

  if (channelError || !channel) {
    return NextResponse.json({ error: 'Canal não encontrado' }, { status: 404 })
  }

  // Upsert em creator_channels (conflict: channel_id + platform)
  const { data, error } = await supabase
    .from('creator_channels')
    .upsert(
      {
        channel_id: channelId,
        platform: 'twitch',
        platform_user_id: twitchUserId,
        platform_username: twitchUsername,
        auto_record: autoRecord,
      },
      { onConflict: 'channel_id,platform' }
    )
    .select()
    .single()

  if (error) {
    console.error('[admin/channels] upsert error:', error)
    return NextResponse.json({ error: 'Erro ao salvar canal' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 200 })
}
