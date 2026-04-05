# Claude Code — Contexto do Projeto

> Este arquivo serve como briefing rápido para iniciar sessões com Claude Code sem perda de contexto.
> Copie e cole no início de uma sessão nova se necessário.

---

## Projeto: Vod.TV

Plataforma de VOD (Video on Demand) para criadores brasileiros, similar ao Vody.gg.
Modelo: criadores hospedam conteúdo exclusivo atrás de paywall por assinatura.

**URL de produção:** https://vod-tv.vercel.app
**Repositório local:** `D:/.ANTDEV/02 - PROJECTS/Websites/vod-tv`

---

## Stack completa

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS + tokens customizados |
| Fonte | Geist (primary) + Plus Jakarta Sans (secondary) |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Cloudflare R2 (S3-compatible) |
| Streaming | HLS via hls.js |
| Deploy | Vercel |
| Worker | Node.js 20 (Railway/Render) — processo externo |

---

## Fase atual (Abril 2026)

**Ciclo 1 (concluído):** Follow, Like, Views, Sidebar collapse
**Em andamento:** Sistema de Lives
- Worker Node.js — monitora Twitch via EventSub, grava com streamlink+ffmpeg, upload para R2
- VideoPlayer — hls.js, substitui PaywallCard, serve VODs e lives

---

## Regras críticas (do CLAUDE.md)

1. SEMPRE consulte `styles/style-guide.md` antes de criar componente novo
2. NUNCA hardcode cores — use tokens de `tailwind.config.ts`
3. NUNCA crie componente que já existe — importe
4. Ao implementar tela do Figma, use `get_design_context` com nodeId correto
5. Faça `/clear` quando o context window atingir 40-50%

---

## Componentes existentes

- `components/layout/AppShell.tsx` — shell com sidebar + header
- `components/layout/Sidebar.tsx` — sidebar 255px, colapsável
- `components/layout/Header.tsx` — 56px
- `components/video/VideoCard.tsx` — large (507px) + medium (376px)
- `components/channel/ChannelCard.tsx`, `ChannelRow.tsx`, `ChannelListItem.tsx`
- `components/video/VideoGrid.tsx`
- `components/ui/PageHeader.tsx`
- `components/auth/LoginCard.tsx`

---

## Contexto de negócio importante

- **Concorrente principal:** Vody.gg — já tem Lives, Gamificação ("My Journey"), Categories
- **Gap prioritário:** Lives (em andamento) > Categories > Gamificação
- **Mercado:** Brasil — criadores de conteúdo, modelo de assinatura exclusiva

---

## Onde encontrar o que

| O quê | Onde |
|-------|------|
| Design tokens | `styles/tokens.css` + `tailwind.config.ts` |
| Guia de estilos | `styles/style-guide.md` |
| Schema Supabase | `PRD-supabase-data.md` |
| Componentes Figma | `CLAUDE.md` seção "Mapeamento Figma → Código" |
| Research competitivo | `COMPETITIVE_GAPS.md` + `vault/Research/` |
| Decisões técnicas | `vault/Decisoes/` |
| Backlog | `vault/Backlog/Features.md` |
