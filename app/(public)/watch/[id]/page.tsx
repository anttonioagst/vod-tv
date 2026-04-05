import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PaywallCard from '@/components/video/PaywallCard'
import VideoCard from '@/components/video/VideoCard'
import VideoPlayer from '@/components/video/VideoPlayer'
import VideoActions from '@/components/video/VideoActions'
import { getRelatedVideos } from '@/lib/supabase/queries/videos'
import { getVideoWithLiveData } from '@/lib/supabase/queries/lives'
import { getChannelBySlug } from '@/lib/supabase/queries/channels'
import { getIsLiked, getIsFollowing } from '@/lib/supabase/queries/user-data'
import { recordView } from '@/lib/supabase/actions/video'

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

interface WatchPageProps {
  params: Promise<{ id: string }>
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params

  const videoData = await getVideoWithLiveData(id)
  if (!videoData) notFound()
  const { liveSession, ...video } = videoData

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [relatedResult, channelResult] = await Promise.allSettled([
    getRelatedVideos(video.channelId, video.id),
    getChannelBySlug(video.channelSlug),
  ])
  void recordView(video.id, user?.id)

  const relatedVideos = relatedResult.status === 'fulfilled' ? relatedResult.value : []
  const channel = channelResult.status === 'fulfilled' ? channelResult.value : null

  let isLiked = false
  let isSubscribed = false
  let isFollowing = false
  let isWatchLater = false

  if (user) {
    const [likedRes, subRes, followRes, watchLaterRes] = await Promise.allSettled([
      getIsLiked(user.id, video.id),
      supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('channel_id', video.channelId)
        .maybeSingle(),
      getIsFollowing(user.id, video.channelId),
      supabase
        .from('watch_later')
        .select('id')
        .eq('user_id', user.id)
        .eq('video_id', video.id)
        .maybeSingle(),
    ])
    isLiked = likedRes.status === 'fulfilled' ? likedRes.value : false
    isSubscribed = subRes.status === 'fulfilled' ? !!(subRes.value as { data: unknown }).data : false
    isFollowing = followRes.status === 'fulfilled' ? followRes.value : false
    isWatchLater = watchLaterRes.status === 'fulfilled' ? !!(watchLaterRes.value as { data: unknown }).data : false
  }

  const showPlayer = !video.isExclusive || isSubscribed

  return (
    <div className="flex gap-6 px-6 py-5">

      {/* ── Coluna principal ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Player */}
        {showPlayer && video.hlsUrl ? (
          <VideoPlayer
            hlsUrl={video.hlsUrl}
            mp4Url={video.mp4Url ?? undefined}
            isLive={liveSession?.status === 'recording'}
            poster={video.thumbnail}
            title={video.title}
          />
        ) : (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
            <PaywallCard channelName={video.channelSlug} />
          </div>
        )}

        {/* Título + meta */}
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold text-primary leading-snug">{video.title}</h1>
          <p className="text-sm text-muted">
            {formatViews(video.views)} visualizações · {formatDate(video.createdAt)}
          </p>
        </div>

        <div className="h-px bg-vod-subtle" />

        {/* Canal + botões de ação */}
        <div className="flex items-center justify-between gap-4 flex-wrap">

          {/* Info do canal */}
          <div className="flex items-center gap-3">
            <Link href={`/channel/${video.channelSlug}`} className="shrink-0">
              <div className="relative w-11 h-11 rounded-full overflow-hidden">
                <Image
                  src={video.channelAvatar}
                  alt={video.channelName}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              </div>
            </Link>
            <div className="flex flex-col gap-0.5">
              <Link
                href={`/channel/${video.channelSlug}`}
                className="font-bold text-base text-primary hover:text-accent transition-colors duration-150"
              >
                {video.channelName}
              </Link>
              <div className="flex items-center gap-1.5">
                {isFollowing && (
                  <span className="text-2xs font-semibold text-accent">Seguindo</span>
                )}
                {isFollowing && isSubscribed && (
                  <span className="text-2xs text-muted">·</span>
                )}
                {isSubscribed && (
                  <span className="text-2xs font-semibold text-accent">Assinante</span>
                )}
                {!isFollowing && !isSubscribed && (
                  <span className="text-sm text-muted">
                    {channel?.videoCount ?? 0} vídeos
                  </span>
                )}
              </div>
            </div>
            {!isSubscribed && (
              <button className="ml-1 bg-accent text-accent-fg rounded-sm px-3 py-[7px] text-sm font-bold hover:opacity-90 transition-opacity">
                Assinar
              </button>
            )}
          </div>

          {/* Like, Share, Save, Download */}
          <VideoActions
            videoId={video.id}
            videoTitle={video.title}
            mp4Url={video.mp4Url}
            initialIsLiked={isLiked}
            initialIsSaved={isWatchLater}
            isLoggedIn={!!user}
          />
        </div>

        {/* Descrição */}
        {video.description && (
          <div className="bg-surface-secondary rounded-lg px-4 py-3.5 flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-primary">Descrição</p>
            <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>
          </div>
        )}

        {/* Comentários */}
        <div className="flex flex-col gap-4 pb-8">
          <h3 className="text-base font-bold text-primary">Comentários</h3>

          {user ? (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-vod shrink-0 mt-1" />
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  placeholder="Adicione um comentário..."
                  className="w-full bg-transparent border-b border-vod focus:border-accent outline-none py-1.5 text-sm text-primary placeholder:text-muted resize-none transition-colors duration-150"
                  rows={1}
                />
                <div className="flex justify-end gap-2">
                  <button className="px-3 py-1.5 text-sm text-muted hover:text-secondary transition-colors">
                    Cancelar
                  </button>
                  <button
                    disabled
                    title="Em breve"
                    className="px-3 py-1.5 text-sm font-medium bg-vod text-muted rounded-sm cursor-not-allowed"
                  >
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-accent hover:underline">
              Faça login para comentar
            </Link>
          )}

          {/* Estado vazio */}
          <div className="flex flex-col items-center py-10 gap-1.5">
            <p className="text-base font-medium text-secondary">Sem comentários ainda</p>
            <p className="text-sm text-muted">Seja o primeiro a comentar neste vídeo</p>
          </div>
        </div>

      </div>

      {/* ── Sidebar: vídeos relacionados ── */}
      <div className="w-[396px] shrink-0 flex flex-col gap-3 pt-1">
        <h3 className="text-base font-bold text-primary">Mais vídeos</h3>
        {relatedVideos.map(v => (
          <VideoCard key={v.id} video={v} size="medium" />
        ))}
        {relatedVideos.length === 0 && (
          <p className="text-sm text-muted">Nenhum vídeo relacionado</p>
        )}
      </div>

    </div>
  )
}
