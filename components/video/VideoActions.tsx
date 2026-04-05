'use client'
import { useState, useTransition } from 'react'
import { ThumbsUp, Share2, Bookmark, Download } from 'lucide-react'
import { toggleLike, toggleWatchLater } from '@/lib/supabase/actions/video'

interface VideoActionsProps {
  videoId: string
  videoTitle: string
  mp4Url: string | null
  initialIsLiked: boolean
  initialIsSaved: boolean
  isLoggedIn: boolean
}

export default function VideoActions({
  videoId,
  videoTitle,
  mp4Url,
  initialIsLiked,
  initialIsSaved,
  isLoggedIn,
}: VideoActionsProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [copied, setCopied] = useState(false)
  const [likePending, startLikeTransition] = useTransition()
  const [savePending, startSaveTransition] = useTransition()

  function handleLike() {
    if (!isLoggedIn) { window.location.href = '/login'; return }
    const next = !isLiked
    setIsLiked(next)
    startLikeTransition(async () => {
      try { await toggleLike(videoId) }
      catch { setIsLiked(!next) }
    })
  }

  function handleSave() {
    if (!isLoggedIn) { window.location.href = '/login'; return }
    const next = !isSaved
    setIsSaved(next)
    startSaveTransition(async () => {
      try { await toggleWatchLater(videoId) }
      catch { setIsSaved(!next) }
    })
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: videoTitle, url }).catch(() => null)
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const base = 'flex items-center gap-2 px-4 py-2 rounded-sm border text-sm font-medium transition-colors duration-150 cursor-pointer'
  const idle = 'border-vod text-secondary hover:border-accent hover:text-accent'
  const active = 'border-accent text-accent'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Curtir */}
      <button
        onClick={handleLike}
        disabled={likePending}
        className={`${base} ${isLiked ? active : idle} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <ThumbsUp size={16} className={isLiked ? 'fill-accent' : ''} />
        <span>{isLiked ? 'Curtido' : 'Curtir'}</span>
      </button>

      {/* Compartilhar */}
      <button onClick={handleShare} className={`${base} ${idle}`}>
        <Share2 size={16} />
        <span>{copied ? 'Link copiado!' : 'Compartilhar'}</span>
      </button>

      {/* Salvar */}
      <button
        onClick={handleSave}
        disabled={savePending}
        className={`${base} ${isSaved ? active : idle} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Bookmark size={16} className={isSaved ? 'fill-accent' : ''} />
        <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
      </button>

      {/* Download — só quando mp4 disponível */}
      {mp4Url && (
        <a
          href={mp4Url}
          download
          className={`${base} ${idle}`}
        >
          <Download size={16} />
          <span>Download</span>
        </a>
      )}
    </div>
  )
}
