import Sidebar from './Sidebar'
import Header from './Header'

interface AppShellProps {
  children: React.ReactNode
  isLoggedIn?: boolean
  activePath?: string
  user?: { name: string; avatar?: string }
  followedChannels?: { name: string; slug: string; avatar?: string }[]
}

export default function AppShell({
  children,
  isLoggedIn = false,
  activePath,
  user,
  followedChannels,
}: AppShellProps) {
  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar isLoggedIn={isLoggedIn} activePath={activePath} followedChannels={followedChannels} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header isLoggedIn={isLoggedIn} user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
