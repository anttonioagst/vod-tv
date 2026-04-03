'use client'
import { useState, useTransition } from 'react'
import { ThumbsUp } from 'lucide-react'
import { toggleLike } from '@/lib/supabase/actions/video'

interface LikeButtonProps {
  videoId: string
  initialIsLiked: boolean
  isLoggedIn: boolean
}

export default function LikeButton({ videoId, initialIsLiked, isLoggedIn }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    const optimistic = !isLiked
    setIsLiked(optimistic)
    startTransition(async () => {
      try {
        await toggleLike(videoId)
      } catch {
        setIsLiked(!optimistic)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-sm border transition-colors duration-150
        ${isLiked
          ? 'border-accent text-accent'
          : 'border-vod text-secondary hover:border-accent hover:text-accent'
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <ThumbsUp size={16} />
      <span className="font-primary font-medium text-base">
        {isLiked ? 'Curtido' : 'Curtir'}
      </span>
    </button>
  )
}
