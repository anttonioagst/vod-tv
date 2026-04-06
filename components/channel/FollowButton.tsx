'use client'

import { useState, useTransition } from 'react'
import { UserPlus, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toggleFollow } from '@/lib/supabase/actions/channel'

interface FollowButtonProps {
  channelId: string
  channelSlug: string
  initialIsFollowing: boolean
  isLoggedIn: boolean
}

export default function FollowButton({
  channelId,
  channelSlug,
  initialIsFollowing,
  isLoggedIn,
}: FollowButtonProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    startTransition(async () => {
      const prev = isFollowing
      setIsFollowing(!prev)
      try {
        await toggleFollow(channelId, channelSlug)
      } catch {
        setIsFollowing(prev)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 border rounded-lg px-3 py-[9px] transition-colors shrink-0 disabled:opacity-60 ${
        isFollowing
          ? 'border-accent text-accent'
          : 'border-vod text-white hover:border-accent hover:text-accent'
      }`}
    >
      {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
      <span className="font-medium text-base">
        {isFollowing ? 'Seguindo' : 'Seguir'}
      </span>
    </button>
  )
}
