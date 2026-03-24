import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds → uso: bg-surface, bg-surface-secondary, etc.
        surface: {
          DEFAULT: '#0c0c0c',
          secondary: '#191919',
          elevated: '#262626',
          card: '#19191a',
        },

        // Bordas → uso: border-vod, border-vod-subtle
        vod: {
          DEFAULT: '#3e3e3e',
          subtle: '#343434',
        },

        // Textos → uso: text-primary, text-secondary, etc.
        primary: '#ffffff',
        secondary: '#bfbebe',
        muted: '#737373',
        subtle: '#a1a1a1',

        // Accent → uso: bg-accent, text-accent
        accent: {
          DEFAULT: '#fdff79',
          fg: '#0c0c0c',
        },
      },
      fontFamily: {
        primary: ['Geist', 'sans-serif'],
        secondary: ['Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
        '2xs': '8px',   // badge "Exclusivo"
        xs: '10px',     // duração do vídeo
        sm: '12px',     // labels de seção, channel name, @handle
        base: '14px',   // nav, botões, título de vídeo
        lg: '18px',     // títulos de seção
      },
      fontWeight: {
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        xs: '3px',      // badges
        sm: '6px',      // botão, search bar
        md: '8px',      // avatar sidebar
        lg: '10px',     // cards, thumbnails, nav item ativo
        full: '9999px',
      },
      spacing: {
        sidebar: '255px',
        header: '56px',
      },
      width: {
        sidebar: '255px',
        'search-bar': '568px',
        'video-lg': '507px',
        'video-md': '376px',
        'channel-card': '140px',
      },
      height: {
        header: '56px',
        'search-bar': '42px',
        'thumb-lg': '285px',
        'thumb-md': '211px',
        'channel-avatar': '64px',
        'video-avatar': '37px',
      },
      boxShadow: {
        'vod-button': '0px 1px 2px 0px rgba(255, 255, 255, 0.06)',
        'vod-default': '0px 1px 2px 0px rgba(255, 255, 255, 0.06)',
      },
    },
  },
  plugins: [],
}

export default config
