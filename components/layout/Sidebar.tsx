'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  TrendingUp,
  Tv,
  Star,
  Heart,
  History,
  Clock,
  ThumbsUp,
  Gift,
  Link2,
  Mail,
  MessageCircle,
  FileText,
  Shield,
  ChevronsUpDown,
  List,
} from 'lucide-react'

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
  activePath?: string
}

const EXPLORE_NAV: NavItem[] = [
  { label: 'Início', href: '/home', icon: Home },
  { label: 'Em Alta', href: '/trending', icon: TrendingUp },
  { label: 'Canais', href: '/channels', icon: Tv },
]

const YOU_NAV: NavItem[] = [
  { label: 'Assinaturas', href: '/subscriptions', icon: Star },
  { label: 'Seguindo', href: '/following', icon: Heart },
  { label: 'Histórico', href: '/history', icon: History },
  { label: 'Assistir mais tarde', href: '/watch-later', icon: Clock },
  { label: 'Vídeos Curtidos', href: '/liked', icon: ThumbsUp },
]

const COMMUNITY_NAV: NavItem[] = [
  { label: 'Indicações', href: '/referrals', icon: Gift },
  { label: 'Afiliados', href: '/affiliates', icon: Link2 },
]

const FEATURED_CHANNELS: SidebarChannel[] = [
  { name: 'tteuw', slug: 'tteuw' },
  { name: 'brkk', slug: 'brkk' },
  { name: 'coringa', slug: 'coringa' },
]

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2 p-2 w-full text-secondary text-base font-medium transition-colors rounded-lg ${
        isActive
          ? 'bg-vod'
          : 'hover:bg-vod'
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

export default function Sidebar({ isLoggedIn = false, activePath }: SidebarProps) {
  return (
    <aside className="w-[255px] h-screen flex flex-col bg-surface border-r border-vod overflow-y-auto shrink-0">
      {/* Logo */}
      <div className="p-4 flex items-center">
        <span className="text-white text-xl font-bold tracking-widest">VOD</span>
      </div>

      {/* Explorar */}
      <div className="border-b border-vod-subtle">
        <div className="px-2 py-1">
          <SectionLabel>Explorar</SectionLabel>
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
          <div className="px-2 py-1">
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
          <div className="px-2 py-1">
            <SectionLabel>Comunidade</SectionLabel>
            <nav className="flex flex-col gap-0.5">
              {COMMUNITY_NAV.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Explorar Canais */}
      <div className="border-b border-vod-subtle">
        <div className="px-2 py-1">
          <SectionLabel>Explorar canais</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {FEATURED_CHANNELS.map((channel) => (
              <Link
                key={channel.slug}
                href={`/channel/${channel.slug}`}
                className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors"
              >
                <div className="w-[26px] h-[26px] rounded-md bg-secondary shrink-0" />
                <span className="text-white text-base font-medium truncate">
                  {channel.name}
                </span>
              </Link>
            ))}
            <button className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors text-secondary text-base font-medium">
              <List size={16} />
              <span>Mostrar Mais</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="px-2 py-1">
        <SectionLabel>Contato</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <a
            href="mailto:contato@vod.tv"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors text-secondary text-base font-medium"
          >
            <Mail size={16} />
            <span>contato@vod.tv</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors text-secondary text-base font-medium"
          >
            <MessageCircle size={16} />
            <span>Discord</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors text-secondary text-base font-medium"
          >
            <FileText size={16} />
            <span>Diretrizes</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors text-secondary text-base font-medium"
          >
            <Shield size={16} />
            <span>DMCA</span>
          </a>
          <button className="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-vod transition-colors text-secondary text-base font-medium">
            <ChevronsUpDown size={16} />
            <span>Expandir/Recolher</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
