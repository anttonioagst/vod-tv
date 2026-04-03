'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Gift, Link2, Mail, ChevronsUpDown } from 'lucide-react'
import SvgIcon from '@/components/ui/SvgIcon'

type IconProps = { size?: number; className?: string }

const HomeIcon       = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/home.svg"          size={size} className={className} />
const TrendingIcon   = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/trending.svg"      size={size} className={className} />
const ChannelsIcon   = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/channels.svg"      size={size} className={className} />
const SubscriptionsIcon = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/subscriptions.svg" size={size} className={className} />
const FollowingIcon  = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/following.svg"     size={size} className={className} />
const HistoryIcon    = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/history.svg"       size={size} className={className} />
const LikedIcon      = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/most-liked.svg"    size={size} className={className} />
const DiscordIcon    = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/discord.svg"       size={size} className={className} />
const GuidelinesIcon = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/guidelines.svg"    size={size} className={className} />
const CopyrightIcon  = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/copyright.svg"     size={size} className={className} />
const MoreListIcon   = ({ size = 16, className }: IconProps) => <SvgIcon src="/icons/more-list.svg"     size={size} className={className} />

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface SidebarChannel {
  name: string
  slug: string
  avatar?: string
}

interface SidebarProps {
  isLoggedIn?: boolean
  followedChannels?: SidebarChannel[]
  className?: string
}

const EXPLORE_NAV: NavItem[] = [
  { label: 'Início',   href: '/home',     icon: HomeIcon },
  { label: 'Em Alta',  href: '/trending', icon: TrendingIcon },
  { label: 'Canais',   href: '/channels', icon: ChannelsIcon },
]

const YOU_NAV: NavItem[] = [
  { label: 'Assinaturas',       href: '/subscriptions', icon: SubscriptionsIcon },
  { label: 'Seguindo',          href: '/following',     icon: FollowingIcon },
  { label: 'Histórico',         href: '/history',       icon: HistoryIcon },
  { label: 'Assistir mais tarde', href: '/watch-later', icon: Clock },
  { label: 'Vídeos Curtidos',   href: '/liked',         icon: LikedIcon },
]

const COMMUNITY_NAV: NavItem[] = [
  { label: 'Indicações', href: '/referrals',  icon: Gift },
  { label: 'Afiliados',  href: '/affiliates', icon: Link2 },
]

const FEATURED_CHANNELS: SidebarChannel[] = [
  { name: 'tteuw',   slug: 'tteuw' },
  { name: 'brkk',    slug: 'brkk' },
  { name: 'coringa', slug: 'coringa' },
]

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2 p-2 w-full text-secondary text-base font-medium transition-colors duration-150 ease-out rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod ${
        isActive ? 'bg-vod' : 'hover:bg-vod'
      }`}
    >
      <Icon size={16} />
      <span>{item.label}</span>
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 h-8 flex items-center text-sm text-secondary font-medium">
      {children}
    </div>
  )
}

export default function Sidebar({ isLoggedIn = false, followedChannels, className }: SidebarProps) {
  const sidebarChannels = (isLoggedIn && followedChannels && followedChannels.length > 0)
    ? followedChannels
    : FEATURED_CHANNELS

  return (
    <aside className={`w-[255px] h-screen flex flex-col bg-surface border-r border-vod overflow-y-auto shrink-0${className ? ` ${className}` : ''}`}>
      {/* Logo */}
      <div className="p-4 flex items-center">
        <Image src="/icons/vod-logo.svg" alt="Vod TV" width={52} height={36} />
      </div>

      {/* Explorar */}
      <div className="border-b border-vod-subtle">
        <div className="p-2">
          <nav className="flex flex-col gap-0.5">
            {EXPLORE_NAV.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Você — só se logado */}
      {isLoggedIn && (
        <div className="border-b border-vod-subtle">
          <div className="p-2">
            <SectionLabel>Você</SectionLabel>
            <nav className="flex flex-col gap-0.5">
              {YOU_NAV.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Comunidade — só se logado */}
      {isLoggedIn && (
        <div className="border-b border-vod-subtle">
          <div className="p-2">
            <SectionLabel>Comunidade</SectionLabel>
            <nav className="flex flex-col gap-0.5">
              {COMMUNITY_NAV.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Explorar Canais / Seguindo */}
      <div className="border-b border-vod-subtle">
        <div className="p-2">
          <SectionLabel>
            {isLoggedIn && followedChannels && followedChannels.length > 0 ? 'Seguindo' : 'Explorar'}
          </SectionLabel>
          <div className="flex flex-col gap-0.5">
            {sidebarChannels.map((channel) => (
              <Link
                key={channel.slug}
                href={`/channel/${channel.slug}`}
                className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
              >
                <div className="w-[26px] h-[26px] rounded-md bg-secondary shrink-0" />
                <span className="text-white text-base font-medium font-secondary truncate">{channel.name}</span>
              </Link>
            ))}
            <button className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod">
              <MoreListIcon size={16} />
              <span>Mostrar Mais</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="p-2">
        <SectionLabel>Contato</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <a
            href="mailto:contato@vod.tv"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
          >
            <Mail size={16} />
            <span>contato@vod.tv</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
          >
            <DiscordIcon size={16} />
            <span>Discord</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
          >
            <GuidelinesIcon size={16} />
            <span>Diretrizes da Comunidade</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
          >
            <CopyrightIcon size={16} />
            <span>Direitos Autorais/DMCA</span>
          </a>
          <button className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod">
            <ChevronsUpDown size={16} />
            <span>Expandir/Recolher</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
