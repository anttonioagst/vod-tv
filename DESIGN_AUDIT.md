# DESIGN_AUDIT.md — Vod.TV
> Auditoria completa extraída do Figma via MCP
> Figma File: `2gbD3wnO3AaeyYnLMeyOUL`
> Data: 2026-03-31

---

## Home (não logado) — nodeId 47:69

**Dimensões do frame:** 1440×900px (desktop)
**Background:** `#0c0c0c`

### Tipografia

| Elemento | Fonte | Tamanho | Peso | Cor |
|----------|-------|---------|------|-----|
| Nav items | Geist Medium | 14px | 500 | `#bfbebe` |
| Section labels (Você, Explorar, Contato) | Inter/Geist Medium | 12px | 500 | `#bfbebe` |
| Video title | Geist Bold | 14px | 700 | `#ffffff` |
| Channel name (card info) | Plus Jakarta Sans Bold | 12px | 700 | `#737373` |
| Section title "Canais Para Assistr" | Geist SemiBold | 18px | 600 | `#ffffff` |
| Channel card name | Plus Jakarta Sans Bold | 14px | 700 | `#ffffff` |
| Channel card handle | Plus Jakarta Sans Medium | 12px | 500 | `#a1a1a1` |
| Badge "Exclusivo" | Plus Jakarta Sans Bold | 8px | 700 | `#fdff79` |
| Badge duração | Geist Bold | 10px | 700 | `#ffffff` |
| Search bar placeholder | Geist Medium | 14px | 500 | `#3e3e3e` (on home) / `#737373` (on watch/channel) |
| Botão "Entrar" | Geist Bold | 14px | 700 | `#0c0c0c` |
| Sidebar channels (Explorar) | Plus Jakarta Sans Medium | 14px | 500 | `#ffffff` |

### Espaçamentos

| Elemento | Valor |
|----------|-------|
| Sidebar padding (logo) | 16px all |
| Sidebar nav section padding | 8px all |
| Nav item padding | 8px all |
| Main content padding | 16px all |
| Section title bottom padding | 18px |
| Video cards gap (large) | justify-between |
| Channel cards row | justify-between |
| Video info gap | 10px |
| Video title/channel gap | 4px |
| Channel card gap (name/handle) | 10px |
| Large video section bottom padding | 40px |
| Channel section bottom padding | 40px |

### Componentes

#### Sidebar — 255px
- **Background:** `#0c0c0c`
- **Border:** `border-r: 1px solid #3e3e3e`
- **Logo area:** 16px padding, logo SVG 52×36px
- **Sections:** divididas por `border-b: 1px solid #343434`
- **Nav item default:** 8px padding, gap-8px, icon 16×16px, no background
- **Nav item active:** `bg: #3e3e3e`, `border-radius: 10px`
- **Nav item hover:** `bg: #3e3e3e`
- **Section divider:** `border-b: 1px solid #343434`
- **Section label:** 12px Geist/Inter Medium `#bfbebe`, height 32px
- **Channel item:** 8px padding, avatar 26×26px `rounded-[8px]` bg `#bfbebe`, name 14px white
- **Estrutura de seções no Figma (ordem):**
  1. `div-explorer` — SEM label: Início, Em Alta, Canais
  2. `div-you` — Label "Você": Assinaturas, Seguindo, Histórico, Assistir mais tarde, Vídeos Curtidos
  3. `div-comunidade` — Label "Comunidade": Indicações, Afiliados
  4. `div-explore` — Label "Explorar": canal list (tteuw, brkk, coringa) + Mostrar Mais
  5. `div-contact` — Label "Contato": email, Discord, Diretrizes, DMCA, Expandir/Recolher

> **BUG ENCONTRADO:** O código atual usa "Explorar" como label do grupo superior (Início/Em Alta/Canais), mas no Figma esse grupo NÃO tem label. "Explorar" é o label correto para o grupo de canais (tteuw, brkk, coringa).

#### Header — 56px
- **Background:** `#0c0c0c`
- **Border:** `border-b: 1px solid #3e3e3e`
- **Padding:** 10px all
- **Search bar:** 568×42px, opacity 0.67
  - Input: `bg #191919`, border `#3e3e3e`, rounded-bl-[6px] rounded-tl-[6px], padding l-11px
  - Placeholder: "Buscar lives..." — 14px Geist Medium `#3e3e3e` (home) / `#737373` (watch/channel)
  - Button: `bg #262626`, border `#3e3e3e`, rounded-br-[6px] rounded-tr-[6px], px-24 py-12
  - Search icon: 16×16px
- **Adjusts (Settings) button:** 36×36px, icon 20×18px
- **Botão "Entrar":** `bg #fdff79`, px-17 py-9, rounded-[6px], shadow `0px 1px 2px rgba(255,255,255,0.06)`
  - Icon: 16×16px (login arrow)
  - Text: 14px Geist Bold `#0c0c0c`

> **BUG ENCONTRADO:** Placeholder do search diz "Pesquisar" mas Figma mostra "Buscar lives..."

#### VideoCard Large — 507×332px
- **Thumbnail:** 507×285px, `border-radius: 10px`, `overflow: hidden`
- **Time badge:** abs bottom-right, `left: 448px top: 256px` (10px from edges), `bg #3e3e3e`, rounded-[3px], px-5 py-3
- **Exclusive badge:** abs top-left (10px from edges), `bg #3e3e3e`, rounded-[3px], px-5 py-3, gap-2px, icon 12×12px
- **Info row:** gap-10px, items-start
- **Avatar:** 37×37px, rounded-[10px]
- **Title:** 14px Geist Bold white, h-[15px]
- **Channel:** 12px Plus Jakarta Sans Bold `#737373`
- **Gap title/channel:** 4px
- **Total card gap (thumb to info):** 10px

> **GAP:** Sem hover state no VideoCard (sem lift, sem shadow enhancement)

#### VideoCard Medium — 376×258px
- Mesmo padrão do Large, thumbnail 376×211px
- Badges mesmos posicionamentos relativos

#### ChannelCard — 140px largura
- **Background:** `#19191a`
- **Border:** `1px solid #3e3e3e`
- **Border-radius:** 10px
- **Padding:** px-38 py-15
- **Avatar:** 64×64px, circular (Ellipse no Figma), centered
- **Name:** 14px Plus Jakarta Sans Bold white
- **Handle:** 12px Plus Jakarta Sans Medium `#a1a1a1`
- **Gap (name/handle):** 10px

> **GAP:** O avatar no código usa `rounded-full` mas está correto (imagem circular). No entanto, o layout de posicionamento do avatar usa `w-full h-[64px]` no Figma (centrado), enquanto o código usa container `w-[64px] h-[64px]`.

---

## Watch / Vídeo — nodeId 129:4395

**Background:** `#0c0c0c`

### Layout
- Sidebar esquerda: 255px
- Área de vídeo: flex-1 pr-[416px] (espaço para sidebar direita)
- Sidebar direita (vídeos relacionados): absolute, right-4 top-[17px], w-[387px]
- Vídeo container: h-[800px], `border-radius: 10px`, `bg: #171717`

### Paywall Screen
- **Ícone cadeado:** container 65×64px, bg `rgba(253,255,121,0.05)`, rounded-[100px]
- **Título:** 24px Geist SemiBold white, text-center
- **Subtítulo:** 16px Geist Medium `#737373`, multi-linha, text-center
- **Cards container:** flex, gap-12px, justify-center, pt-8px

#### Card Individual
- **Background:** `rgba(25,25,25,0.2)`
- **Border:** `1px solid #3e3e3e`
- **Border-radius:** 10px
- **Padding:** 16px all
- **Badge:** bg `rgba(62,62,62,0.6)`, px-10 py-2, rounded-[10px], 14px Geist Medium white, "individual"
- **Descrição:** 12px Geist Medium `#737373`, mb-12
- **Preço:** 24px Geist SemiBold white + "/mês" 12px `#737373`
- **Botão Assinar:** bg `#fdff79`, px-16 py-10, rounded-[6px], w-full, icon + "Assinar"

#### Card Global (Recomendado) — highlighted
- **Background:** `rgba(253,255,121,0.05)`
- **Border:** `1px solid #fdff79`
- **Border-radius:** 10px
- **Padding:** 16px all
- **Badge 1:** bg `#fdff79`, px-10 py-2, rounded-[10px], icon 12px, "individual" (Geist Medium 14px black)
- **Badge 2:** bg `rgba(253,255,121,0.05)`, px-10 py-4, rounded-[10px], "RECOMENDADO" (Geist Medium 10px `#fdff79`)
- **Preço:** 24px Geist SemiBold white + "/mês"
- **Botão:** bg `#fdff79`, full width, "Assinar global"

> **BUG:** PaywallCard atual tem badge "global" no card destacado, mas Figma mostra "individual" com ícone star. O botão "Assinar global" é correto.

### Header (logado)
- Bell notification icon: 36×36px container, icon 20×18px
- Avatar: 32×32px, `border-radius: 10px`, shadow `0px 1px 2px rgba(255,255,255,0.06)`

---

## Canal — nodeId 116:3968

**Background:** `#0c0c0c`

### Banner + Perfil
- **Banner:** w-full h-[224px], rounded-[10px]
- **Avatar flutuante:** absolute, left-0 top-[-48px] (relative ao container do perfil), 160×160px
  - Inner image: 150×150px, rounded-[10px], border-4 border-[#0c0c0c]
  - Outer wrapper: 160×160px

### Info do Canal
- **Nome:** 30px Geist Bold white
- **Handle:** 14px Geist Medium `#737373`
- **Separador:** 3×3px rounded-full `#737373`
- **Video count:** 14px Geist Medium `#737373`
- **Botão Assinar:** bg `#fdff79`, px-16 py-10, rounded-[6px], gap-8px, star icon + "Assinar" Geist Bold 14px `#0c0c0c`
- **Botão Favorito:** bg `#191919`, border `#3e3e3e`, rounded-[6px], size-[36px], icon heart `#fdff79` 20×20px

### Tabs (Vídeos / Gratuito / Playlists / Sobre)
- **Container:** border-b `#3e3e3e`, gap-5px
- **Tab ativa:** 14px Geist Medium white, border-b-2 white, p-16
- **Tab inativa:** 14px Geist Medium `#737373`, border-b `#737373`, p-16
- **Diferença do código:** O código usa `border-b border-muted -mb-px` nas tabs inativas — Figma confirma esse padrão. ✓

### ChannelVideoBar
- **Título "Conteúdo":** 18px Geist SemiBold white
- **Search inline:** bg `#191919`, border `#3e3e3e`, rounded-[6px], px-12 py-8, icon + "Buscar lives..." 14px `#a1a1a1`
- **Filtro ativo ("Mais recentes"):** bg `#fdff79`, px-16 py-10, rounded-[6px], icon + label Geist Bold 14px `#0c0c0c`
- **Filtros inativos:** bg `#262626`, px-16 py-10, rounded-[6px], Geist Bold 14px white
- Estado atual do código: usa `bg-surface-elevated` nos inativos e `bg-accent` no ativo. ✓

### Video Grid (Canal)
- Badge badges no channel page usam `rgba(0,0,0,0.62)` em vez de `#3e3e3e`

> **GAP SUTIL:** Badges no canal têm bg semi-transparente (`rgba(0,0,0,0.62)`) enquanto na home usam `#3e3e3e`. O VideoCard atual usa `bg-vod` (`#3e3e3e`) fixo, sem suporte a variante transparente.

---

## Login — nodeId 94:1352

> (Não auditado em detalhes nesta sessão — requer get_design_context separado)

---

## Ícones SVG — Análise

Os ícones do Figma são assets exportados como imagens (não SVG inline no design). O projeto atual usa **Lucide React** como substituto. Os ícones do Figma:

| Ícone Figma | Lucide Equivalente | Status |
|-------------|-------------------|--------|
| Home | `Home` | ✓ Adequado |
| Em Alta (flame/trending) | `TrendingUp` | ⚠ Diferente |
| Channels (TV) | `Tv` | ✓ Adequado |
| Signatures (star) | `Star` | ✓ Adequado |
| Following (heart) | `Heart` | ✓ Adequado |
| Historical (clock/history) | `History` | ✓ Adequado |
| Watch later (clock) | `Clock` | ✓ Adequado |
| Most liked (thumb) | `ThumbsUp` | ✓ Adequado |
| Referrals (gift) | `Gift` | ✓ Adequado |
| Affiliates (link) | `Link2` | ✓ Adequado |
| Discord | `MessageCircle` | ⚠ Deveria ser ícone Discord real |
| Search | `Search` | ✓ |
| Settings (adjusts) | `Settings` | ✓ Adequado |
| Lock | `Lock` | ✓ |
| Logo VOD.TV | **texto "VOD"** | ❌ Deveria ser SVG do logo |

---

## ⚠ GAPS DE UX/UI IDENTIFICADOS

### 🔴 Críticos (impacto direto na fidelidade visual)

1. **Logo ausente** — Sidebar exibe texto "VOD" em vez do logo SVG do Figma (52×36px)

2. **Sidebar section labels erradas** — A seção superior (Início/Em Alta/Canais) tem label "Explorar" no código, mas no Figma essa seção NÃO tem label. "Explorar" é a label correta para a seção de canais (tteuw/brkk/coringa).

3. **Search placeholder errado** — "Pesquisar" vs Figma "Buscar lives..."

4. **VideoCard sem hover state** — Nenhuma micro-animação de lift (`translateY(-4px)`) ou shadow enhancement no hover. Todos os cards da plataforma devem ter este comportamento.

5. **Tokens de animação ausentes** — `tailwind.config.ts` e `tokens.css` não possuem durações de transição, easing curves, ou utilidades de animação. Sem eles, transições ficam inconsistentes.

### 🟡 Importantes (afetam percepção de qualidade premium)

6. **ChannelCard avatar layout** — Container usa `w-[64px] h-[64px]` no código mas Figma usa `h-[64px] w-full` com imagem centrada. Diferença visual em viewports menores.

7. **Badges no canal com bg errado** — Dentro da página de canal, badges de vídeo deveriam ter `rgba(0,0,0,0.62)` (semi-transparente) para melhor leitura sobre thumbnails, não `#3e3e3e` sólido.

8. **PaywallCard badge errado** — Badge do card "Global Pass" diz "global" mas Figma mostra "individual" com ícone star (o plano global inclui canais individuais).

9. **Escala tipográfica incompleta** — Faltam tokens para 16px (subtítulo), 24px (heading paywall/preço), 30px (nome do canal). Usados inline com `text-[30px]` em vez de classes utilitárias.

10. **Shadow tokens insuficientes** — Apenas `vod-button` e `vod-default` (ambos idênticos). Faltam: `glow-accent` (para CTA hover), `lift-card` (para VideoCard hover), `dropdown` (para user menu).

### 🟢 Melhorias premium (diferenciam de "funcional" para "premium")

11. **Botões sem micro-animação no active** — Botões devem ter `scale(0.97)` no `:active` para feedback tátil.

12. **Botão CTA sem glow no hover** — O botão "Entrar"/  "Assinar" deveria ter sutil glow amarelo no hover (`box-shadow: 0 0 12px rgba(253,255,121,0.4)`).

13. **NavLink sem transição suave** — Transição de bg no hover é instantânea. Deve ser `transition-colors duration-150`.

14. **ChannelCard sem hover lift** — Cards de canal deveriam ter `hover:-translate-y-0.5` + `transition-transform`.

15. **Focus ring ausente em elementos interativos** — Nenhum elemento tem `focus-visible:ring-2 focus-visible:ring-accent` para acessibilidade de teclado.

16. **Sem loading skeleton** — Todas as páginas de dados usam `loading.tsx` genérico. Deveriam ter skeleton screens com a forma dos componentes.

17. **Sem estado empty** — VideoGrid não renderiza nada quando vazia. Deveria ter um `<EmptyState>` contextual.

18. **Tipografia inconsistente** — Mix de `font-['Inter:Medium']` e `font-['Geist:Medium']` no Figma para o mesmo contexto. O código normaliza para Geist (correto).

---

## Tokens Extraídos do Figma (completo)

### Cores
```
#0c0c0c    surface / accent-fg
#191919    surface-secondary / surface-card
#262626    surface-elevated
#19191a    channel-card bg
#3e3e3e    border-vod / badge-bg / nav-hover
#343434    border-vod-subtle / section-dividers
#ffffff    text-primary
#bfbebe    text-secondary
#737373    text-muted
#a1a1a1    text-subtle
#fdff79    accent
rgba(253,255,121,0.05)   accent/5 (glow bg)
rgba(62,62,62,0.6)       badge bg (muted)
rgba(0,0,0,0.62)         badge bg sobre thumbnail (canal)
#171717    video-frame bg (watch page)
```

### Tipografia
```
8px   Plus Jakarta Sans Bold    badge "Exclusivo"
10px  Geist Bold                duração de vídeo
10px  Geist Medium              badge "RECOMENDADO"
12px  Geist/Plus Jakarta Sans   labels, channel name, @handle, preço /mês
14px  Geist Medium/Bold         nav, botões, tabs, título vídeo
16px  Geist Medium              subtítulo paywall
18px  Geist SemiBold            section titles
24px  Geist SemiBold            heading paywall, preço
30px  Geist Bold                channel name heading
```

### Sombras
```
0px 1px 2px rgba(255,255,255,0.06)   button default (light rim)
```
