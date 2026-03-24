import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-plus-jakarta-sans',
})

export const metadata: Metadata = {
  title: 'Vod.TV',
  description: 'Plataforma de streaming de vídeo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-surface text-white antialiased">
        {children}
      </body>
    </html>
  )
}
