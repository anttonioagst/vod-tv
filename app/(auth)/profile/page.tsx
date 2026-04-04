import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ChannelTabs from '@/components/channel/ChannelTabs'
import ChannelVideoBar from '@/components/channel/ChannelVideoBar'
import VideoGrid from '@/components/video/VideoGrid'
import EmptyState from '@/components/ui/EmptyState'
import { ThumbsUp } from 'lucide-react'
import { getLikedVideos } from '@/lib/supabase/queries/user-data'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, bio')
    .eq('id', user.id)
    .single()

  const videos = await getLikedVideos(user.id)

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Usuário'
  const avatarUrl = profile?.avatar_url ?? `https://picsum.photos/seed/${user.id}/160/160`
  const username = `@${user.email?.split('@')[0] ?? 'usuario'}`
  const bannerUrl = `https://picsum.photos/seed/${user.id}-banner/1633/224`

  return (
    <div className="px-4 pt-4 flex flex-col overflow-clip">

      {/* Banner */}
      <div className="relative w-full h-[224px] rounded-lg overflow-hidden bg-surface-secondary">
        <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
      </div>

      {/* Perfil */}
      <div className="flex items-start gap-0 py-4 relative">

        {/* Avatar flutuante */}
        <div className="absolute -top-[48px] left-0 w-[160px] h-[160px]
                        rounded-lg overflow-hidden border-4 border-surface shrink-0">
          <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
        </div>

        {/* Spacer */}
        <div className="w-[160px] shrink-0" />

        {/* Info + ações */}
        <div className="flex flex-col gap-[10px] p-[10px]">
          <p className="font-primary font-bold text-[30px] text-primary leading-none">
            {displayName}
          </p>
          <div className="flex items-center gap-1">
            <span className="font-primary font-medium text-[14px] text-muted">
              {username}
            </span>
            {profile?.bio && (
              <>
                <div className="w-[3px] h-[3px] rounded-full bg-muted" />
                <span className="font-primary font-medium text-[14px] text-muted">
                  {profile.bio}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="bg-accent text-accent-fg rounded-sm
                         px-4 py-[10px] flex items-center gap-2
                         hover:opacity-90 transition-opacity duration-150 ease-out
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <Settings size={16} />
              <span className="font-primary font-bold text-[14px]">Editar Perfil</span>
            </Link>
          </div>
        </div>
      </div>

      <ChannelTabs />
      <ChannelVideoBar />

      {videos.length > 0 ? (
        <VideoGrid videos={videos} size="medium" />
      ) : (
        <EmptyState
          icon={<ThumbsUp size={48} />}
          title="Nenhum vídeo curtido ainda"
          subtitle="Vídeos que você curtir aparecerão aqui"
        />
      )}
    </div>
  )
}
