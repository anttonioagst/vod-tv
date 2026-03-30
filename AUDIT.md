# VodTV — Auditoria de Código
_Gerado em: 2026-03-28_

---

## 🔴 Crítico (quebra em produção)

| # | Arquivo | Linha | Problema | Como corrigir |
|---|---------|-------|---------|---------------|
| 1 | `app/(auth)/home/page.tsx` | — | **Arquivo não existe.** O CLAUDE.md mapeia `app/(auth)/home/page.tsx` como página da Home logada, mas o arquivo está ausente. A rota `/home` para usuários autenticados não tem página — o middleware não redireciona `/home` para o grupo `(auth)`, então o usuário logado cai no `(public)/home/page.tsx` que não usa dados reais da sessão. | Criar `app/(auth)/home/page.tsx` com conteúdo personalizado para o usuário logado. |
| 2 | `middleware.ts` | 41–43 | **Conflito de rotas `/home` pública vs. protegida.** O middleware lista `/home` como rota protegida, mas `app/(public)/home/page.tsx` existe e é estática. Isso cria conflito: usuário não logado tentando acessar `/home` é redirecionado para `/login` corretamente, mas o App Router serve a página pública antes do middleware agir em certos edge cases. Além disso, a ausência de `app/(auth)/home/page.tsx` faz a proteção ser inútil. | Remover `/home` da lista `protectedPaths` no middleware (já que existe versão pública) ou criar a versão autenticada e usar rewrite condicional. |
| 3 | `app/auth/callback/route.ts` | 19–21 | **`cookieStore.set()` em Route Handler com `cookies()` assíncrono pode não propagar cookies para o redirect.** O código chama `cookieStore.set()` diretamente, mas o `NextResponse.redirect()` na linha 29 é uma response separada — os cookies setados no `cookieStore` não são automaticamente copiados para o response de redirect. A sessão pode não ser persistida. | Usar o padrão com response explícita: criar o `NextResponse.redirect()` primeiro, depois setar os cookies diretamente na response via `response.cookies.set()`. |
| 4 | `app/(auth)/affiliates/page.tsx` | 21 | **Link `/affiliates/apply` incorreto.** O href aponta para `/affiliates/apply` mas a rota real no App Router é `/affiliates/apply` dentro do grupo `(auth)`. Isso funciona em runtime, mas a URL absoluta pode falhar se o usuário não estiver autenticado (o middleware não protege `/affiliates/apply` explicitamente — só `/affiliates`). | Confirmar que `/affiliates/apply` está protegido no middleware e usar `href="/affiliates/apply"`. Adicionar `/affiliates/apply` à lista `protectedPaths` do middleware. |

---

## 🟡 Médio (degradação de UX)

| # | Arquivo | Linha | Problema | Como corrigir |
|---|---------|-------|---------|---------------|
| 1 | `app/` (todo o diretório) | — | **Nenhum `loading.tsx` em nenhuma rota.** Páginas dinâmicas (ex: `/channel/[slug]`, `/watch/[id]`, todas as rotas `(auth)`) não têm skeleton/loading state. O usuário vê tela em branco durante server rendering. | Criar `loading.tsx` para cada rota dinâmica ou ao menos para os grupos `(auth)` e as rotas com params. |
| 2 | `app/` (todo o diretório) | — | **Nenhum `error.tsx` em nenhuma rota.** Sem error boundaries, qualquer erro não tratado em server component vai lançar uma página de erro genérica do Next.js, sem branding e sem opção de recovery. | Criar `error.tsx` com `'use client'` nos grupos `(auth)`, `(public)` e nas rotas dinâmicas. |
| 3 | `app/(auth)/affiliates/apply/page.tsx` | 36–43 | **Formulário sem handler de submit, sem validação e sem feedback de erro.** O `<button type="submit">` não está dentro de um `<form>`, não tem `action` nem `onSubmit`. Clicar em "Enviar candidatura" não faz nada. | Envolver em `<form>`, adicionar `'use client'`, implementar `handleSubmit` com validação básica e feedback visual (loading state, mensagem de sucesso/erro). |
| 4 | `app/(auth)/affiliates/apply/page.tsx` | 36 | **`<button type="submit">` fora de um `<form>`** — não dispara submit. O botão existe mas é inerte. | Adicionar `<form onSubmit={handleSubmit}>` envolvendo os inputs. |
| 5 | `components/auth/LoginCard.tsx` | 31–36 | **Sem tratamento de erro no OAuth.** Se `supabase.auth.signInWithOAuth()` retornar erro, o `loading` fica travado em `'google'` ou `'twitch'` e o usuário não recebe feedback. | Capturar o erro com `const { error } = await supabase.auth.signInWithOAuth(...)` e mostrar mensagem de erro; resetar `setLoading(null)` no catch. |
| 6 | `app/(public)/home/page.tsx` | 1–29 | **Página pública usa `AppShell` com `isLoggedIn={false}` hardcoded**, ignorando completamente se o usuário está logado. Um usuário autenticado acessando `/home` vê a versão não logada do header/sidebar sem os menus "Você" e "Comunidade". | Verificar sessão no server component e passar `isLoggedIn` corretamente, ou criar a rota `(auth)/home/page.tsx`. |
| 7 | `app/(public)/trending/page.tsx` | 8 | **Mock duplicado e hardcoded.** `[...mockVideos, ...mockVideos].slice(0, 12)` duplica o array para forçar 12 itens. Isso mascara que só existem 7 vídeos mockados e resulta em IDs e conteúdos duplicados na grid (chave `key` com `video.id` vai colidir). | Usar apenas `mockVideos` enquanto não há API real, ou garantir IDs únicos ao duplicar. |
| 8 | `app/watch/[id]/page.tsx` | 21–25 | **Layout do player com `pr-[403px]` e sidebar `absolute` quebrará em telas menores.** A sidebar de relacionados é `absolute right-4` com largura fixa de 387px, sem nenhum breakpoint responsivo. Em telas abaixo de ~1200px o conteúdo se sobrepõe. | Usar `flex` com `min-w` ou adicionar breakpoints responsivos. |
| 9 | `components/layout/Sidebar.tsx` | 94 | **Prop `activePath` recebida mas nunca usada.** A Sidebar recebe `activePath?: string` no tipo mas usa apenas `usePathname()` internamente para detectar rota ativa. A prop é passada por todos os parents mas descartada silenciosamente. | Remover `activePath` do tipo `SidebarProps` e do componente, já que `usePathname()` trata isso. |
| 10 | `app/(auth)/layout.tsx` | 23 | **`activePath={undefined}` passado explicitamente.** Dado que a prop não é usada (problema #9), isso é ruído. Além disso, o AuthLayout não detecta o path atual para destacar o item ativo de forma server-side. | Remover `activePath={undefined}` da chamada do `AppShell`. |
| 11 | `app/channel/[slug]/page.tsx` | 18 | **Fallback silencioso para canal inexistente.** Se o slug não corresponder a nenhum canal, usa `mockChannels[0]` sem nenhum aviso, 404 ou redirecionamento. | Retornar 404 com `notFound()` do `next/navigation` quando o canal não for encontrado. |
| 12 | `app/watch/[id]/page.tsx` | 13 | **Fallback silencioso para vídeo inexistente.** Mesma questão: se `id` não existir, usa `mockVideos[0]` sem 404. | Usar `notFound()` quando o vídeo não for encontrado. |

---

## 🟢 Baixo (melhorias de qualidade)

| # | Arquivo | Linha | Problema | Como corrigir |
|---|---------|-------|---------|---------------|
| 1 | `components/video/PaywallCard.tsx` | múltiplas | **Cores hardcoded que deveriam usar tokens do design system.** Ex: `text-[#fdff79]`, `text-[#737373]`, `bg-[#fdff79]`, `text-[#0c0c0c]`, `hover:bg-[#e8ea60]`, `border-[#3e3e3e]`, `bg-[rgba(253,255,121,0.05)]`. | Substituir por `text-accent`, `text-muted`, `bg-accent`, `text-accent-fg`, `border-vod`, `bg-surface-secondary` dos tokens do Tailwind. |
| 2 | `components/channel/ChannelHeader.tsx` | múltiplas | **Cores hardcoded.** Ex: `text-[#737373]`, `bg-[#fdff79]`, `text-[#0c0c0c]`, `hover:bg-[#e8ea60]`, `bg-[#191919]`, `border-[#3e3e3e]`, `border-[#0c0c0c]`, `hover:border-[#fdff79]`. | Substituir pelos tokens equivalentes do design system. |
| 3 | `components/channel/ChannelVideoBar.tsx` | múltiplas | **Cores hardcoded.** Ex: `bg-[#191919]`, `border-[#3e3e3e]`, `text-[#a1a1a1]`, `bg-[#fdff79]`, `text-[#0c0c0c]`, `bg-[#262626]`, `hover:bg-[#333]`. | Substituir pelos tokens do design system. |
| 4 | `components/channel/ChannelTabs.tsx` | 20, 28 | **Cores hardcoded.** `border-[#3e3e3e]` e `text-[#737373]`. | Usar `border-vod` e `text-muted`. |
| 5 | `app/watch/[id]/page.tsx` | 22 | **Cor hardcoded `bg-[#171717]`** para o container do player. Não existe token para este valor (é entre `surface` #0c0c0c e `surface-secondary` #191919). | Avaliar se deve ser `bg-surface-secondary` ou adicionar token `surface-player` ao design system. |
| 6 | `components/video/PaywallCard.tsx` | múltiplas | **`font-geist` como classe Tailwind não existe no config.** O Tailwind config define `fontFamily.primary: ['Geist', 'sans-serif']` mas a classe seria `font-primary`, não `font-geist`. A classe `font-geist` é ignorada silenciosamente (a fonte ainda funciona via CSS var no `body`, mas não de forma explícita). | Substituir `font-geist` por `font-primary` (que é o alias configurado) ou remover a classe já que Geist é a fonte padrão do `body`. |
| 7 | `components/channel/ChannelHeader.tsx` | múltiplas | **Mesma questão de `font-geist` não definido no Tailwind config.** | Mesmo que acima. |
| 8 | `components/channel/ChannelVideoBar.tsx` | múltiplas | **Mesma questão de `font-geist`.** | Mesmo que acima. |
| 9 | `components/channel/ChannelTabs.tsx` | 25 | **Mesma questão de `font-geist`.** | Mesmo que acima. |
| 10 | `components/video/PaywallCard.tsx` | 58 | **Label "individual" repetida nos dois cards de preço.** O segundo card (Global Pass/Recomendado) exibe "individual" no badge quando deveria ser "global" ou "vod pass". Parece um erro de copy. | Corrigir o texto para "global" ou o nome correto do plano. |
| 11 | `components/channel/ChannelVideoBar.tsx` | 26 | **Search bar do canal exibe texto fixo "Buscar lives..."** sem funcionalidade real. É apenas visual, sem `<input>`. | Converter para `<input type="text">` real quando a funcionalidade for implementada, ou deixar explicitamente como placeholder com `cursor-not-allowed`. |
| 12 | `components/layout/Sidebar.tsx` | 60–64 | **Canais no sidebar são hardcoded** (`FEATURED_CHANNELS` com tteuw, brkk, coringa). Em produção deveriam vir de API. | Passar `channels` como prop no `Sidebar` ou buscar via Server Component. |
| 13 | `components/layout/Sidebar.tsx` | 158–161 | **Botão "Mostrar Mais" sem ação.** Apenas visual, sem funcionalidade. | Implementar expand/collapse ou remover até que haja funcionalidade. |
| 14 | `components/layout/Sidebar.tsx` | 179, 185, 191 | **Links de contato com `href="#"`.** Discord, Diretrizes e DMCA apontam para `#`. | Substituir pelos links reais ou remover até tê-los. |
| 15 | `components/layout/Sidebar.tsx` | 198–203 | **Botão "Expandir/Recolher" sem ação.** | Implementar lógica de collapse do sidebar ou remover. |
| 16 | `lib/mock-data.ts` | 3–101 | **Todos os dados são mock.** Nenhuma page busca dados reais via Supabase. Em produção, qualquer erro de dados seria mascarado. | Implementar camada de dados real com Supabase; manter mocks apenas para testes/dev. |
| 17 | `next.config.ts` | 5–11 | **`remotePatterns` só permite `picsum.photos`.** Em produção, avatares e thumbnails reais (Supabase Storage, CDN, etc.) vão falhar com erro de imagem. | Adicionar os domínios de produção ao `remotePatterns` (ex: Supabase storage bucket). |
| 18 | `middleware.ts` | 52–54 | **Warning de deprecação do Next.js 16.** `"middleware" file convention is deprecated. Please use "proxy" instead.`** O build já emite este warning. | Renomear `middleware.ts` para `proxy.ts` e adaptar conforme a documentação do Next.js 16 sobre proxies. |
| 19 | `app/(public)/home/page.tsx` | 8–9 | **Lógica de slice hardcoded** (`mockVideos.slice(0, 3)` e `mockVideos.slice(3)`). Com poucos vídeos mockados (7 total), a seção "medium" terá apenas 4 itens — layout irregular. | Tornar os limites configuráveis via props ou buscar dados reais paginados. |
| 20 | `components/auth/LoginCard.tsx` | 80 | **Cor hardcoded `hover:border-[#9146FF]`** para o botão Twitch. É aceitável para brand color externa, mas idealmente deveria ser uma variável CSS ou token. | Criar token `twitch: '#9146FF'` no Tailwind config ou manter como constante documentada. |

---

## ✅ Está bem

- **Build sem erros de TypeScript ou de compilação** — `npm run build` conclui com sucesso, 16 rotas geradas.
- **Autenticação OAuth estruturada corretamente** — `LoginCard.tsx` usa `createBrowserClient`, `server.ts` usa `createServerClient` com cookies, separação clara cliente/servidor.
- **`middleware.ts` exclui `/auth/callback`** do matcher — o callback de OAuth não é interceptado.
- **Variáveis de ambiente usam `NEXT_PUBLIC_`** — todos os `process.env` acessados tanto no client quanto no server usam prefixo público correto.
- **`AuthLayout` faz double-check de sessão** — mesmo que o middleware proteja, o layout verifica `supabase.auth.getUser()` e redireciona para `/login` se não houver sessão (defesa em profundidade).
- **Sem `console.log` ou `console.error` esquecidos** em nenhum arquivo.
- **Sem `any`, `@ts-ignore` ou `@ts-nocheck`** em nenhum arquivo.
- **Sem Server Components usando hooks** — componentes com `useState`/`useEffect` têm `'use client'` corretamente declarado (`LoginCard`, `Sidebar`, `Header`, `ChannelHeader`, `ChannelTabs`, `ChannelVideoBar`).
- **Design system de tokens bem implementado** em `tailwind.config.ts` — cores, tipografia, border-radius e dimensões fixas consistentes com o CLAUDE.md.
- **Separação clara de rotas** com grupos `(public)` e `(auth)` no App Router.
- **`next/image` usado em todos os lugares** que carregam imagens externas — sem `<img>` nativo.
- **`params` tratado como `Promise`** nas rotas dinâmicas (`channel/[slug]` e `watch/[id]`) — correto para Next.js 15+.
- **Geist + Plus Jakarta Sans configurados** corretamente no `RootLayout` com variáveis CSS.
- **Sem imports quebrados** — todos os imports de componentes e lib resolvem para arquivos existentes.
- **Tipos TypeScript bem definidos** em `lib/types.ts` — `Video`, `Channel`, `User` sem uso de `any`.

---

## Build

**Status: SUCESSO** (com 1 warning)

```
▲ Next.js 16.2.1 (Turbopack)
✓ Compiled successfully in 19.7s
✓ Generating static pages (16/16) in 751ms
```

**Warning encontrado:**
```
⚠ The "middleware" file convention is deprecated.
  Please use "proxy" instead.
  Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

**Ação necessária:** Renomear `middleware.ts` → `proxy.ts` e ajustar conforme a nova API do Next.js 16. Este warning não quebra o build atual mas indica que a API será removida em versão futura.

**Rotas geradas:**
- 5 rotas estáticas (`/`, `/_not-found`, `/channels`, `/home`, `/login`, `/trending`)
- 11 rotas dinâmicas (server-rendered on demand)
