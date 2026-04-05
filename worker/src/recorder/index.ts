import { spawn, type ChildProcess } from 'child_process'
import { mkdirSync, readdirSync, rmSync, statSync } from 'fs'
import { join } from 'path'
import { supabase } from '../supabase.js'
import { uploadFile } from '../storage/r2.js'
import { config } from '../config.js'

type ActiveRecording = {
  liveSessionId: string
  channelUsername: string
  outputDir: string
  streamlinkProcess: ChildProcess
  ffmpegProcess: ChildProcess
  startedAt: Date
}

// liveSessionId → recording
const active = new Map<string, ActiveRecording>()

/**
 * Inicia gravação de um canal.
 * Fluxo: streamlink → pipe → ffmpeg → .mp4 em /tmp
 */
export function startRecording(liveSessionId: string, channelUsername: string): void {
  if (active.has(liveSessionId)) {
    console.log(`[recorder] sessão ${liveSessionId} já está sendo gravada`)
    return
  }

  const outputDir = `/tmp/recordings/${liveSessionId}`
  mkdirSync(outputDir, { recursive: true })
  const mp4Path = join(outputDir, 'recording.mp4')

  console.log(`[recorder] iniciando gravação: ${channelUsername} → ${mp4Path}`)

  // streamlink → stdout
  const streamlink = spawn('streamlink', [
    '--stdout',
    `twitch.tv/${channelUsername}`,
    'best',
  ])

  // ffmpeg consome stdin (pipe de streamlink) e grava .mp4
  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    '-y',
    mp4Path,
  ])

  // Conecta stdout do streamlink → stdin do ffmpeg
  streamlink.stdout.pipe(ffmpeg.stdin)

  streamlink.stderr.on('data', (d: Buffer) => {
    const line = d.toString().trim()
    if (line) console.log(`[streamlink/${channelUsername}] ${line}`)
  })

  ffmpeg.stderr.on('data', (d: Buffer) => {
    const line = d.toString().trim()
    // ffmpeg é verboso — loga apenas erros relevantes
    if (line.includes('Error') || line.includes('error')) {
      console.error(`[ffmpeg/${channelUsername}] ${line}`)
    }
  })

  streamlink.on('error', (err) => {
    console.error(`[recorder] streamlink não encontrado ou erro: ${err.message}`)
    console.error('[recorder] Certifique-se de que streamlink está instalado no Railway (nixpacks.toml)')
  })

  ffmpeg.on('error', (err) => {
    console.error(`[recorder] ffmpeg não encontrado ou erro: ${err.message}`)
  })

  active.set(liveSessionId, {
    liveSessionId,
    channelUsername,
    outputDir,
    streamlinkProcess: streamlink,
    ffmpegProcess: ffmpeg,
    startedAt: new Date(),
  })

  console.log(`[recorder] gravação iniciada para sessão ${liveSessionId}`)
}

/**
 * Para a gravação de uma sessão, converte para HLS e faz upload para R2.
 * Chamado quando stream.offline chega.
 */
export async function stopRecording(liveSessionId: string): Promise<void> {
  const rec = active.get(liveSessionId)
  if (!rec) {
    console.warn(`[recorder] stopRecording: sessão ${liveSessionId} não encontrada`)
    return
  }

  console.log(`[recorder] parando gravação: ${rec.channelUsername}`)

  // Envia SIGTERM ao ffmpeg — ele finaliza o arquivo .mp4 corretamente
  rec.ffmpegProcess.kill('SIGTERM')
  rec.streamlinkProcess.kill('SIGTERM')

  // Aguarda ffmpeg finalizar (timeout 60s)
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('[recorder] timeout aguardando ffmpeg — forçando SIGKILL')
      rec.ffmpegProcess.kill('SIGKILL')
      resolve()
    }, 60_000)

    rec.ffmpegProcess.on('close', () => {
      clearTimeout(timeout)
      resolve()
    })
  })

  active.delete(liveSessionId)

  await processRecording(liveSessionId, rec.outputDir, rec.channelUsername)
}

/**
 * Converte .mp4 → HLS, faz upload de ambos para R2,
 * e notifica o Next.js app via /api/admin/process-vod.
 */
async function processRecording(
  liveSessionId: string,
  outputDir: string,
  channelUsername: string
): Promise<void> {
  const mp4Path = join(outputDir, 'recording.mp4')
  const hlsDir = join(outputDir, 'hls')
  const hlsManifest = join(hlsDir, 'index.m3u8')

  mkdirSync(hlsDir, { recursive: true })

  // Verifica se .mp4 existe e tem tamanho razoável
  try {
    const stat = statSync(mp4Path)
    if (stat.size < 1024) {
      console.error(`[recorder] arquivo .mp4 muito pequeno (${stat.size} bytes) — abortando upload`)
      await markSessionFailed(liveSessionId)
      return
    }
  } catch {
    console.error(`[recorder] arquivo .mp4 não encontrado: ${mp4Path}`)
    await markSessionFailed(liveSessionId)
    return
  }

  console.log(`[recorder] convertendo .mp4 → HLS: ${mp4Path}`)

  // ffmpeg: converte .mp4 → segmentos HLS
  await new Promise<void>((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', mp4Path,
      '-c:v', 'copy',
      '-c:a', 'copy',
      '-f', 'hls',
      '-hls_time', '6',
      '-hls_playlist_type', 'vod',
      '-hls_segment_filename', join(hlsDir, 'seg_%03d.ts'),
      '-y',
      hlsManifest,
    ])

    ff.stderr.on('data', (d: Buffer) => {
      const line = d.toString().trim()
      if (line.includes('Error') || line.includes('error')) {
        console.error(`[ffmpeg/hls] ${line}`)
      }
    })

    ff.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg HLS exited with code ${code}`))
    })
  })

  console.log(`[recorder] HLS gerado — fazendo upload para R2...`)

  // Upload .mp4
  const r2BasePath = `recordings/${liveSessionId}`
  const mp4Url = await uploadFile(`${r2BasePath}/recording.mp4`, mp4Path, 'video/mp4')
  console.log(`[recorder] .mp4 uploadado: ${mp4Url}`)

  // Upload segmentos .ts
  const tsFiles = readdirSync(hlsDir).filter((f) => f.endsWith('.ts'))
  for (const tsFile of tsFiles) {
    await uploadFile(`${r2BasePath}/hls/${tsFile}`, join(hlsDir, tsFile), 'video/MP2T')
  }

  // Lê e atualiza o manifest com URLs absolutas do R2
  const { readFileSync, writeFileSync } = await import('fs')
  let manifest = readFileSync(hlsManifest, 'utf-8')
  manifest = manifest.replace(/seg_(\d+)\.ts/g, `${config.r2.publicUrl}/${r2BasePath}/hls/seg_$1.ts`)
  writeFileSync(hlsManifest, manifest)

  const hlsUrl = await uploadFile(
    `${r2BasePath}/hls/index.m3u8`,
    hlsManifest,
    'application/vnd.apple.mpegurl'
  )
  console.log(`[recorder] HLS manifest uploadado: ${hlsUrl}`)

  // Notifica o Next.js app
  await notifyProcessVod(liveSessionId, hlsUrl, mp4Url)

  // Limpa arquivos temporários
  rmSync(outputDir, { recursive: true, force: true })
  console.log(`[recorder] processamento concluído para sessão ${liveSessionId}`)
}

async function notifyProcessVod(
  liveSessionId: string,
  hlsUrl: string,
  mp4Url: string
): Promise<void> {
  const url = `${config.app.nextAppUrl}/api/admin/process-vod`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': config.app.adminSecret,
      },
      body: JSON.stringify({ liveSessionId, hlsUrl, mp4Url }),
    })

    if (!res.ok) {
      console.error(`[recorder] process-vod retornou ${res.status}: ${await res.text()}`)
    } else {
      console.log(`[recorder] process-vod notificado com sucesso`)
    }
  } catch (err) {
    console.error(`[recorder] erro ao notificar process-vod:`, err)
  }
}

async function markSessionFailed(liveSessionId: string): Promise<void> {
  await supabase
    .from('live_sessions')
    .update({ status: 'failed' })
    .eq('id', liveSessionId)
}

export function getActiveRecordings(): string[] {
  return Array.from(active.keys())
}
