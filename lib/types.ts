export type Video = {
  id: string
  title: string
  thumbnail: string
  duration: string
  channelName: string
  channelAvatar: string
  channelSlug: string
  isExclusive: boolean
  views: number
  createdAt: string
}

export type Channel = {
  id: string
  name: string
  username: string
  avatar: string
  description: string
  videoCount: number
  isSubscribed: boolean
  isFollowing: boolean
}

export type User = {
  id: string
  name: string
  avatar: string
  email: string
}
