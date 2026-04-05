import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function isAdminAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  return req.headers.get('x-admin-secret') === secret
}

/**
 * POST /api/admin/process-vod
 *
 * Chamado pelo worker externo (Railway) quando o VOD está processado e
 * disponível via HLS.
 *
 * Body:
 * {
 *   liveSessionId: string   // UUID da live_session a atualizar
 *   hlsUrl: string          // URL pública do manifest .m3u8 (ex: R2 / CDN)
 *   mp4Url?: string         // URL pública do arquivo .mp4 (opcional)
 *   videoId?: string        // UUID do vídeo já criado em 'videos' (opcional)
 * }
 *
 * Headers:
 *   x-admin-secret: <ADMIN_SECRET>
 *
 * O que faz:
 * 1. Atualiza live_session → status 'completed', hls_url preenchida
 * 2. Se videoId fornecido: atualiza videos.hls_url + videos.mp4_url
 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    liveSessionId?: string
    hlsUrl?: string
    mp4Url?: string
    videoId?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { liveSessionId, hlsUrl, mp4Url, videoId } = body

  if (!liveSessionId || !hlsUrl) {
    return NextResponse.json(
      { error: 'liveSessionId e hlsUrl são obrigatórios' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // 1. Atualiza live_session
  const { error: sessionError } = await supabase
    .from('live_sessions')
    .update({
      status: 'completed',
      hls_url: hlsUrl,
      ...(videoId ? { video_id: videoId } : {}),
    })
    .eq('id', liveSessionId)

  if (sessionError) {
    console.error('[admin/process-vod] live_session update error:', sessionError)
    return NextResponse.json({ error: 'Erro ao atualizar live_session' }, { status: 500 })
  }

  // 2. Se videoId fornecido, atualiza o vídeo com as URLs
  if (videoId) {
    const { error: videoError } = await supabase
      .from('videos')
      .update({
        hls_url: hlsUrl,
        source: 'live_recording',
        live_session_id: liveSessionId,
        ...(mp4Url ? { mp4_url: mp4Url } : {}),
      })
      .eq('id', videoId)

    if (videoError) {
      console.error('[admin/process-vod] video update error:', videoError)
      return NextResponse.json({ error: 'Erro ao atualizar vídeo' }, { status: 500 })
    }
  }

  console.log('[admin/process-vod] VOD processado — liveSession:', liveSessionId)
  return NextResponse.json({ ok: true })
}
