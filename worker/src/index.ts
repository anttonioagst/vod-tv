import 'dotenv/config'
import { createServer } from 'http'
import { config } from './config.js'
import { getActiveCreatorChannels, supabase } from './supabase.js'
import { syncSubscriptions } from './twitch/subscriptions.js'
import { startRecording, stopRecording, getActiveRecordings } from './recorder/index.js'

// ─── Startup ────────────────────────────────────────────────────────────────

async function boot() {
  console.log('[worker] iniciando VodTV Worker...')

  const channels = await getActiveCreatorChannels()
  console.log(`[worker] ${channels.length} canais ativos encontrados`)

  await syncSubscriptions(channels)

  startRealtimeListener()
  startHealthServer()

  console.log('[worker] pronto')
}

// ─── Supabase Realtime ───────────────────────────────────────────────────────
// Escuta INSERT em live_sessions (status='recording') e UPDATE (status='processing')
// Isso desacopla o worker do Next.js — basta o webhook criar/atualizar a row.

function startRealtimeListener() {
  supabase
    .channel('live_sessions_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'live_sessions' },
      async (payload) => {
        const row = payload.new as {
          id: string
          status: string
          channel_id: string
        }

        if (row.status !== 'recording') return

        // Busca o username do canal Twitch
        const { data: creatorChannel } = await supabase
          .from('creator_channels')
          .select('platform_username')
          .eq('channel_id', row.channel_id)
          .eq('platform', 'twitch')
          .maybeSingle()

        if (!creatorChannel) {
          console.warn(`[worker] live_session ${row.id}: canal ${row.channel_id} sem creator_channel`)
          return
        }

        console.log(`[worker] live_session ${row.id} → iniciando gravação de ${creatorChannel.platform_username}`)
        startRecording(row.id, creatorChannel.platform_username)
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'live_sessions' },
      async (payload) => {
        const row = payload.new as { id: string; status: string }

        if (row.status !== 'processing') return

        const recordings = getActiveRecordings()
        if (!recordings.includes(row.id)) return

        console.log(`[worker] live_session ${row.id} → stream offline, parando gravação`)
        await stopRecording(row.id)
      }
    )
    .subscribe((status) => {
      console.log(`[worker] Realtime status: ${status}`)
    })
}

// ─── Health check HTTP ───────────────────────────────────────────────────────
// Railway usa isso para verificar se o serviço está vivo.

function startHealthServer() {
  const server = createServer((req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
      const recordings = getActiveRecordings()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, activeRecordings: recordings.length }))
      return
    }
    res.writeHead(404)
    res.end()
  })

  server.listen(config.app.workerPort, () => {
    console.log(`[worker] health server ouvindo na porta ${config.app.workerPort}`)
  })
}

// ─── Graceful shutdown ───────────────────────────────────────────────────────

process.on('SIGTERM', () => {
  console.log('[worker] SIGTERM recebido — encerrando...')
  // As gravações ativas serão finalizadas pelo stopRecording via SIGTERM no ffmpeg
  process.exit(0)
})

process.on('uncaughtException', (err) => {
  console.error('[worker] uncaughtException:', err)
})

process.on('unhandledRejection', (reason) => {
  console.error('[worker] unhandledRejection:', reason)
})

boot().catch((err) => {
  console.error('[worker] erro no boot:', err)
  process.exit(1)
})
