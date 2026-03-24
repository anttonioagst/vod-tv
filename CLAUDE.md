# CLAUDE.md — VodTV Project Instructions

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Geist font (primary) + Plus Jakarta Sans (secondary)

## Design System
- Tokens CSS: `styles/tokens.css`
- Tailwind config: `tailwind.config.ts`
- Style Guide completo: `styles/style-guide.md`
- Figma source: https://www.figma.com/design/2gbD3wnO3AaeyYnLMeyOUL/Vod.TV

## Regras Críticas
1. SEMPRE consulte `styles/style-guide.md` antes de criar qualquer componente novo
2. NUNCA recrie um componente que já existe — importe
3. NUNCA use cores hardcoded — use os tokens de `tailwind.config.ts` ou CSS vars de `styles/tokens.css`
4. NUNCA use fontes diferentes das definidas no design system (Geist + Plus Jakarta Sans)
5. Ao implementar uma tela do Figma, use `get_design_context` com o nodeId correto antes de escrever código
6. Mantenha o context window limpo: trabalhe em no máximo 40-50% antes de fazer /clear

## Cores — Referência Rápida
| Classe Tailwind | Hex | Uso |
|----------------|-----|-----|
| `bg-surface` | `#0c0c0c` | Fundo principal |
| `bg-surface-secondary` | `#191919` | Inputs, hover |
| `bg-surface-elevated` | `#262626` | Search button |
| `bg-surface-card` | `#19191a` | Channel cards |
| `bg-vod` / `border-vod` | `#3e3e3e` | Bordas, badge bg, hover bg |
| `border-vod-subtle` | `#343434` | Divisores sidebar |
| `text-primary` | `#ffffff` | Títulos |
| `text-secondary` | `#bfbebe` | Nav labels |
| `text-muted` | `#737373` | Channel name |
| `text-subtle` | `#a1a1a1` | @handles |
| `bg-accent` / `text-accent` | `#fdff79` | CTA button, Exclusivo |
| `text-accent-fg` | `#0c0c0c` | Texto em accent |

## Tipografia — Referência Rápida
| Tamanho | Classe | Uso |
|---------|--------|-----|
| 8px | `text-2xs` | Badge "Exclusivo" |
| 10px | `text-xs` | Duração de vídeo |
| 12px | `text-sm` | Labels, @handles |
| 14px | `text-base` | Nav, botões, título vídeo |
| 18px | `text-lg` | Títulos de seção |

## Border Radius — Referência Rápida
| Classe | Valor | Uso |
|--------|-------|-----|
| `rounded-xs` | 3px | Badges |
| `rounded-sm` | 6px | Botões, search |
| `rounded-md` | 8px | Avatar sidebar |
| `rounded-lg` | 10px | Cards, thumbnails |

## Mapeamento Figma → Código
| Tela | nodeId | Path no código |
|------|--------|----------------|
| Home (não logado) | 47:69 | `app/(public)/home/page.tsx` |
| Sidebar | 47:70 | `components/Sidebar.tsx` |
| Header (não logado) | 47:71 | `components/Header.tsx` |
| Em Alta | 92:406 | `app/(public)/trending/page.tsx` |
| Canais | 94:822 | `app/(public)/channels/page.tsx` |
| Home (logado) | 94:1583 | `app/(auth)/home/page.tsx` |
| Assinaturas | 94:2621 | `app/(auth)/subscriptions/page.tsx` |
| Seguindo | 96:827 | `app/(auth)/following/page.tsx` |
| Histórico | 97:1025 | `app/(auth)/history/page.tsx` |
| Assistir mais tarde | 101:1255 | `app/(auth)/watch-later/page.tsx` |
| Vídeos curtidos | 102:1413 | `app/(auth)/liked/page.tsx` |
| Indicações | 102:1569 | `app/(auth)/referrals/page.tsx` |
| Afiliados | 109:2287 | `app/(auth)/affiliates/page.tsx` |
| Afiliados/Aplicar | 113:3564 | `app/(auth)/affiliates/apply/page.tsx` |
| Login | 94:1352 | `app/(public)/login/page.tsx` |
| Canal | 116:3968 | `app/channel/[slug]/page.tsx` |
| Vídeo | 129:4395 | `app/watch/[id]/page.tsx` |

## Componentes — nodeIds de referência
| Componente | nodeId |
|-----------|--------|
| Video Card (large, 507px) | 88:100 |
| Channel Card (140px) | 88:206 |
| Botão Entrar (primary-button) | 72:156 |
| Search Bar (568px) | 72:138 |

## Workflow por Tela (seguir sempre)
1. `get_design_context` no nodeId da tela
2. Verificar quais componentes já existem em `components/`
3. Criar apenas componentes novos necessários
4. Montar a página importando os componentes
5. `/clear` antes de passar para a próxima tela

## Dimensões Fixas dos Componentes
- **Sidebar:** 255px largura
- **Header:** 56px altura
- **Video Card Large:** 507px × 332px (thumb: 507×285px)
- **Video Card Medium:** 376px × 258px (thumb: 376×211px)
- **Channel Card:** 140px largura, avatar 64px
- **Video Card avatar:** 37×37px
- **Search Bar:** 568px × 42px
- **Ícones nav:** 16×16px

## Componentes já existentes (atualizar conforme criados)
- [x] AppShell (sidebar + header + main) — `components/layout/AppShell.tsx`
- [x] Sidebar — `components/layout/Sidebar.tsx`
- [x] Header — `components/layout/Header.tsx`
- [x] VideoCard (large + medium) — `components/video/VideoCard.tsx`
- [x] ChannelCard — `components/channel/ChannelCard.tsx`
- [x] VideoGrid — `components/video/VideoGrid.tsx`
- [x] ChannelRow — `components/channel/ChannelRow.tsx`
- [x] ChannelListItem — `components/channel/ChannelListItem.tsx`
- [x] PageHeader — `components/ui/PageHeader.tsx`
- [x] LoginCard — `components/auth/LoginCard.tsx`
- [ ] Button (primary) — inline no Header, extrair se reutilizado
- [ ] SearchBar — inline no Header, extrair se reutilizado
- [ ] Badge (exclusive + duration) — inline no VideoCard, extrair se reutilizado
