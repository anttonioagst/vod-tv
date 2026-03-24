# VodTV Style Guide
> Extraído do Figma via MCP — 2026-03-21
> Fonte: https://www.figma.com/design/2gbD3wnO3AaeyYnLMeyOUL/Vod.TV

---

## Identidade Visual

Dark theme extremo com fundo quase-preto (#0c0c0c). Accent amarelo-neon (#fdff79) usado com parcimônia apenas em CTAs e badges de destaque. Interface minimalista com bordas sutis. Sem gradientes, sem brancos, sem cores vibrantes além do accent.

---

## Paleta de Cores

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--color-bg-primary` | `#0c0c0c` | Fundo principal da aplicação, sidebar, header |
| `--color-bg-secondary` | `#191919` | Input fields, hover de items da sidebar |
| `--color-bg-elevated` | `#262626` | Botão de busca (search button) |
| `--color-bg-card` | `#19191a` | Channel cards |
| `--color-border-default` | `#3e3e3e` | Bordas gerais (sidebar, header, cards), fundo de badges |
| `--color-border-subtle` | `#343434` | Divisores entre seções da sidebar |
| `--color-text-primary` | `#ffffff` | Títulos de vídeo, nome do canal no card, texto de botões |
| `--color-text-secondary` | `#bfbebe` | Labels de navegação da sidebar |
| `--color-text-muted` | `#737373` | Nome do canal abaixo do título de vídeo |
| `--color-text-subtle` | `#a1a1a1` | @handle nos channel cards |
| `--color-accent` | `#fdff79` | Botão primário CTA, texto do badge "Exclusivo" |
| `--color-accent-foreground` | `#0c0c0c` | Texto sobre fundos accent (botão Entrar) |

---

## Tipografia

### Fonte Primária: Geist
Fonte principal de UI — todos os textos de interface, navegação, botões.
**Pesos usados:** Medium (500), SemiBold (600), Bold (700)

| Tamanho | Uso |
|---------|-----|
| `10px` | Duração do vídeo (badge `1:30:00`) |
| `12px` | Labels de seção na sidebar ("Você", "Explorar"), section labels |
| `14px` | Nav items, botões, título de vídeo no card, placeholder do search |
| `18px` | Títulos de seção ("Canais Para Assistir") |

### Fonte Secundária: Plus Jakarta Sans
Usada exclusivamente para **nome de canal** em cards e channel cards.
**Pesos usados:** Medium (500), Bold (700)

| Tamanho | Uso |
|---------|-----|
| `8px` | Texto "Exclusivo" no badge de membro |
| `12px` | @handle no channel card, nome do canal abaixo do vídeo |
| `14px` | Nome principal no channel card, channel names na sidebar |

> **Nota:** Alguns labels da sidebar usam Inter Medium como fallback. Em código, usar Geist como padrão.

---

## Border Radius

| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--radius-xs` | `3px` | Badges (duração do vídeo, "Exclusivo") |
| `--radius-sm` | `6px` | Botão primário, search bar |
| `--radius-md` | `8px` | Avatar de canal na sidebar (26×26px) |
| `--radius-lg` | `10px` | Nav item ativo, thumbnails, video card avatar, channel cards |
| `--radius-full` | `9999px` | Avatares circulares |

---

## Sombras

| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--shadow-button` | `0px 1px 2px 0px rgba(255,255,255,0.06)` | Botão primário, área de ações do header |
| `--shadow-default` | `0px 1px 2px 0px rgba(255,255,255,0.06)` | Sombra padrão geral |

> Sombra é branca com baixíssima opacidade (6%) — cria brilho sutil sobre fundo escuro.

---

## Componentes Base

### Botão Accent (primary-button)
- **Background:** `#fdff79`
- **Texto:** `#0c0c0c` — Geist Bold 14px
- **Border-radius:** `6px`
- **Padding:** `9px 17px`
- **Ícone:** 16×16px à esquerda do texto
- **Shadow:** `0px 1px 2px 0px rgba(255,255,255,0.06)`
- **Uso:** CTA principal (Entrar, Assinar) — APENAS em contextos de destaque máximo

---

### Video Card — Large
- **Largura total:** `507px`
- **Thumbnail:** `507 × 285px`, border-radius: `10px`
- **Gap thumbnail → info:** `10px`
- **Avatar do canal:** `37 × 37px`, border-radius: `10px`
- **Título do vídeo:** Geist Bold `14px` — `#ffffff`
- **Nome do canal:** Plus Jakarta Sans Bold `12px` — `#737373`
- **Gap título → canal:** `4px`
- **Badge duração:** bg `#3e3e3e`, texto branco Geist Bold `10px`, padding `3px 5px`, radius `3px` — canto inferior direito da thumbnail
- **Badge "Exclusivo":** bg `#3e3e3e`, texto `#fdff79` Plus Jakarta Sans Bold `8px`, ícone `12px`, padding `3px 5px`, radius `3px` — canto superior esquerdo

---

### Video Card — Medium
- **Largura total:** `376px`
- **Thumbnail:** `376 × 211px`, border-radius: `10px`
- **Restante igual ao Large**

---

### Channel Card
- **Background:** `#19191a`
- **Border:** `1px solid #3e3e3e`
- **Border-radius:** `10px`
- **Largura:** `140px`
- **Padding:** `15px 38px`
- **Avatar:** `64px`, circular (border-radius: `9999px`)
- **Nome:** Plus Jakarta Sans Bold `14px` — `#ffffff`
- **@handle:** Plus Jakarta Sans Medium `12px` — `#a1a1a1`
- **Gap interno:** `10px`

---

### Sidebar
- **Largura:** `255px`
- **Background:** `#0c0c0c`
- **Borda direita:** `1px solid #3e3e3e`
- **Padding logo area:** `16px`
- **Nav section padding:** `8px`
- **Item padding:** `8px`
- **Item ativo:** bg `#3e3e3e`, border-radius: `10px`
- **Divisores entre seções:** `1px solid #343434`
- **Label de seção ("Você", "Explorar"):** Geist Medium `12px` — `#bfbebe`, padding `8px`, altura `32px`
- **Nav item texto:** Geist Medium `14px` — `#bfbebe`
- **Ícones nav:** `16×16px` SVG
- **Channel mini (Explorar):** avatar `26×26px` radius `8px`, nome Plus Jakarta Sans Medium `14px` — `#ffffff`

---

### Header
- **Altura:** `56px`
- **Background:** `#0c0c0c`
- **Borda inferior:** `1px solid #3e3e3e`
- **Padding:** `10px`
- **Layout:** search bar à esquerda, ações à direita

---

### Search Bar
- **Largura:** `568px` | **Altura:** `42px`
- **Input bg:** `#191919` | Border-radius esquerdo: `6px`
- **Button bg:** `#262626` | Border-radius direito: `6px`
- **Border:** `1px solid #3e3e3e` (top, bottom — sem border entre input e button)
- **Placeholder color:** `#3e3e3e`
- **Placeholder text:** Geist Medium `14px`
- **Input padding:** `11px` vertical, `11px` left
- **Search icon (button):** `16×16px`, padding `12px 24px`
- **Opacidade do componente:** 67% no estado não focado

---

## Ícones

- Tamanho padrão: **16×16px** (nav, botões)
- Tamanho seção header: **20×20px**
- Tamanho ícone "Exclusivo": **12×12px**
- Ícone logo: **52×36px**
- Todos são SVGs inline

---

## Regras de Uso

1. **Accent `#fdff79`** — usar APENAS em: botão primário CTA, texto do badge "Exclusivo"
2. **Nunca** usar gradiente, fundo branco, ou qualquer cor clara como background
3. **Geist** é a fonte padrão de UI — todos os textos que não sejam nome de canal
4. **Plus Jakarta Sans** apenas para: nome de canal em cards, @handles, texto "Exclusivo"
5. **border-radius padrão de cards** é `10px` — não arredondar para `8px` ou `12px`
6. **border-radius de botão** é `6px` — não usar `8px` ou `rounded-full`
7. **Ícones** são SVGs de `16×16px` — não usar icon libraries com tamanhos diferentes
8. **Sombra** é sempre branca com opacidade baixa — nunca sombra escura
9. **Badges** sempre usam `#3e3e3e` como background (mesma cor de border)
10. O layout é sempre **sidebar fixa** + **header fixo** + **área de conteúdo scrollável**
