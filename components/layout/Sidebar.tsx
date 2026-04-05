'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Gift, Link2, Mail, ChevronsUpDown, Radio } from 'lucide-react'
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
  { label: 'Lives',    href: '/lives',    icon: Radio },
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

function NavLink({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      title={item.label}
      className={`flex items-center gap-2 p-2 w-full text-secondary text-base font-medium transition-colors duration-150 ease-out rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod ${
        isActive ? 'bg-vod' : 'hover:bg-vod'
      }`}
    >
      <Icon size={16} />
      <span className={isCollapsed ? 'hidden' : 'block'}>{item.label}</span>
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
  const [isCollapsed, setIsCollapsed] = useState(false)

  const sidebarChannels = (isLoggedIn && followedChannels && followedChannels.length > 0)
    ? followedChannels
    : FEATURED_CHANNELS

  return (
    <aside className={`${isCollapsed ? 'w-[64px]' : 'w-[255px]'} transition-all duration-200 h-screen flex flex-col bg-surface border-r border-vod overflow-y-auto scrollbar-hide shrink-0${className ? ` ${className}` : ''}`}>
      {/* Logo + collapse toggle */}
      <div className={`h-14 flex items-center shrink-0 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {!isCollapsed && <Image src="/icons/vod-logo.svg" alt="Vod TV" width={52} height={36} />}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          title={isCollapsed ? 'Expandir' : 'Recolher'}
          className="p-1.5 rounded-lg hover:bg-vod transition-colors duration-150 text-secondary cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
        >
          <ChevronsUpDown
            size={16}
            className={`${isCollapsed ? 'rotate-90' : ''} transition-transform duration-200`}
          />
        </button>
      </div>

      {/* Explorar */}
      <div className="border-b border-vod-subtle">
        <div className="p-2">
          <nav className="flex flex-col gap-0.5">
            {EXPLORE_NAV.map((item) => (
              <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </nav>
        </div>
      </div>

      {/* Você — só se logado */}
      {isLoggedIn && (
        <div className="border-b border-vod-subtle">
          <div className="p-2">
            {!isCollapsed && <SectionLabel>Você</SectionLabel>}
            <nav className="flex flex-col gap-0.5">
              {YOU_NAV.map((item) => (
                <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Comunidade — só se logado */}
      {isLoggedIn && (
        <div className="border-b border-vod-subtle">
          <div className="p-2">
            {!isCollapsed && <SectionLabel>Comunidade</SectionLabel>}
            <nav className="flex flex-col gap-0.5">
              {COMMUNITY_NAV.map((item) => (
                <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Explorar Canais / Seguindo */}
      <div className="border-b border-vod-subtle">
        <div className="p-2">
          {!isCollapsed && (
            <SectionLabel>
              {isLoggedIn && followedChannels && followedChannels.length > 0 ? 'Seguindo' : 'Explorar'}
            </SectionLabel>
          )}
          <div className="flex flex-col gap-0.5">
            {sidebarChannels.map((channel) => (
              <Link
                key={channel.slug}
                href={`/channel/${channel.slug}`}
                title={channel.name}
                className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
              >
                <div className="w-[26px] h-[26px] rounded-md bg-secondary shrink-0" />
                {!isCollapsed && (
                  <span className="text-white text-base font-medium font-secondary truncate">{channel.name}</span>
                )}
              </Link>
            ))}
            <button
              title="Mostrar Mais"
              className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
            >
              <MoreListIcon size={16} />
              {!isCollapsed && <span>Mostrar Mais</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="p-2">
        {!isCollapsed && <SectionLabel>Contato</SectionLabel>}
        <div className="flex flex-col gap-0.5">
          <a
            href="mailto:contato@vod.tv"
            title="contato@vod.tv"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
          >
            <Mail size={16} />
            {!isCollapsed && <span>contato@vod.tv</span>}
          </a>
          <a
            href="#"
            title="Discord"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
          >
            <DiscordIcon size={16} />
            {!isCollapsed && <span>Discord</span>}
          </a>
          <a
            href="#"
            title="Diretrizes da Comunidade"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
          >
            <GuidelinesIcon size={16} />
            {!isCollapsed && <span>Diretrizes da Comunidade</span>}
          </a>
          <a
            href="#"
            title="Direitos Autorais/DMCA"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors duration-150 ease-out text-secondary text-base font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vod"
          >
            <CopyrightIcon size={16} />
            {!isCollapsed && <span>Direitos Autorais/DMCA</span>}
          </a>
        </div>
      </div>
    </aside>
  )
}
