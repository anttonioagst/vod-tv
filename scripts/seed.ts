import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const channels = [
  {
    slug: 'tteuw',
    name: 'tteuw',
    username: '@tteuw',
    description: 'Streamer competitivo de FPS',
    avatar_url: 'https://picsum.photos/seed/ch1/64/64',
  },
  {
    slug: 'brkk',
    name: 'brkk',
    username: '@brkk',
    description: 'FPS e estratégia',
    avatar_url: 'https://picsum.photos/seed/ch2/64/64',
  },
  {
    slug: 'coringa',
    name: 'coringa',
    username: '@coringa',
    description: 'Entretenimento geral',
    avatar_url: 'https://picsum.photos/seed/ch3/64/64',
  },
  {
    slug: 'noxss',
    name: 'noxss',
    username: '@noxss',
    description: 'RPG e aventura',
    avatar_url: 'https://picsum.photos/seed/ch4/64/64',
  },
  {
    slug: 'phantom',
    name: 'phantom',
    username: '@phantom',
    description: 'Esports e torneios',
    avatar_url: 'https://picsum.photos/seed/ch5/64/64',
  },
]

const videoTitles = [
  'Stream de 8 horas seguidas',
  'Ranked até o limite',
  'Jogando com inscritos ao vivo',
  'Gameplay noturno',
  'Torneio especial',
  'Late night chill',
  'Especial fim de semana',
  'Maratona de jogos',
  'Treino intensivo',
  'Clutch moments da semana',
  'Best of — highlights',
  'Road to challenger',
  'Fim de temporada',
  'Noite de terror',
  'Co-op com amigos',
  'Try hard Friday',
  'Casual Sunday',
  'AMA ao vivo',
  'Highlights do mês',
  'Season finale',
]

async function seed() {
  console.log('Limpando dados anteriores...')
  await supabase.from('videos').delete().not('id', 'is', null)
  await supabase.from('channels').delete().not('id', 'is', null)

  console.log('Inserindo canais...')
  const { data: insertedChannels, error: chErr } = await supabase
    .from('channels')
    .insert(channels)
    .select()

  if (chErr) {
    console.error('Erro ao inserir canais:', chErr)
    return
  }

  console.log(`${insertedChannels!.length} canais inseridos.`)

  console.log('Inserindo vídeos...')
  const videos = videoTitles.map((title, i) => ({
    channel_id: insertedChannels![i % insertedChannels!.length].id,
    title,
    thumbnail_url: `https://picsum.photos/seed/v${i + 1}/507/285`,
    duration_seconds: Math.floor(Math.random() * 28800) + 600, // 10min a 8h
    is_exclusive: i % 3 === 0,
    view_count: Math.floor(Math.random() * 15000) + 500,
    published_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }))

  const { error: vErr } = await supabase.from('videos').insert(videos)
  if (vErr) {
    console.error('Erro ao inserir vídeos:', vErr)
    return
  }

  console.log(`${videos.length} vídeos inseridos.`)
  console.log('Seed concluído com sucesso!')
}

seed()
