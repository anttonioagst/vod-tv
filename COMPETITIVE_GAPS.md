# Competitive Gap Analysis

> Concorrente analisado: Vody.gg (https://vody.gg)
> Projeto: Vod.TV (https://vod-tv.vercel.app)
> Data: 03/04/2026
> Fontes: scraping de vody.gg/tteuw, vody.gg/beliene, vody.gg/watch, resultados de busca indexados

---

## Resumo executivo

O Vody.gg é o concorrente direto mais próximo do Vod.TV: mesma proposta (vídeos exclusivos de criadores, paywall por assinatura, mercado brasileiro), mesma stack de UX (sidebar, canais, watch). A diferença central está em três eixos — **Lives**, **Gamificação ("My Journey")** e **Categories** — que o Vody já opera em produção e o Vod.TV ainda não tem. Fora isso, diversas funcionalidades existem no Vod.TV como UI sem backend real (Follow, Search, Notificações), enquanto no Vody já estão funcionais. O Vod.TV está tecnicamente bem estruturado para evoluir — o gap não é de arquitetura, é de features.

---

## Feature Map — Vody.gg

### Navegação principal (sidebar)

- Início `/`
- Em Alta `/trending`
- Canais `/channels`
- **Categories** `/categories` ← não existe no Vod.TV
- **Lives** (item de menu) ← não existe no Vod.TV

### Área autenticada (sidebar "Você")

- Assinaturas `/subscriptions`
- Seguindo `/followed`
- Histórico `/history`
- Assistir mais tarde `/watch-later`
- Vídeos curtidos `/liked`
- **My Journey** ← gamificação, não existe no Vod.TV

### Canal (`/tteuw`, `/beliene`)

- Banner + Avatar + nome + @handle + contagem de vídeos
- Tabs: Vídeos · Gratuito · **Playlists** · Sobre
- Filtros: Mais recentes · Mais antigos · Mais vistos · Mais curtidos
- Botão Assinar (paywall)
- Botão Seguir

### Watch (`/watch?v=...`)

- Paywall com planos (R$9,90/mês)
- CTA: "Criar conta ou fazer login"

### Rodapé / Contato

- Email: contato@vody.gg
- Discord
- **Termos de Serviço** `/terms`
- **Diretrizes da Comunidade** `/guidelines`
- **Direitos Autorais / DMCA** `/copyright`
- Expandir/Recolher sidebar

### Pricing

- Planos a partir de R$9,90/mês (igual ao Vod.TV)

---

## Gap Analysis Detalhado

### 🔴 Alta Prioridade

| Feature                                                                | Vody.gg                | Vod.TV                                 | Esforço |
| ---------------------------------------------------------------------- | ---------------------- | -------------------------------------- | ------- |
| **Funcionalidade real de Follow** (escrita no banco, sidebar dinâmica) | ✅ Funcional           | ⚠️ UI pronta, sem escrita no DB        | S       |
| **Funcionalidade real de Curtir vídeo** (escrita no banco)             | ✅ Funcional           | ⚠️ Listagem funciona, ação não existe  | S       |
| **Search funcional** (busca real de vídeos/canais)                     | ✅                     | ⚠️ UI pronta, sem lógica               | M       |
| **Lives** (seção de transmissões ao vivo ou VODs marcados como live)   | ✅ Item de menu + rota | ❌ Não existe                          | L       |
| **Categories** (browsing por categoria de conteúdo)                    | ✅ Rota `/categories`  | ❌ Não existe                          | M       |
| **Player de vídeo real** (não apenas paywall)                          | ✅                     | ⚠️ Só paywall, sem player              | XL      |
| **Contagem de views incrementada** (ao assistir)                       | ✅                     | ⚠️ Lida do banco, não incrementada     | S       |
| **Página /profile** (perfil do usuário)                                | ✅                     | ❌ Rota mencionada no menu, não criada | M       |
| **Página /settings** (configurações da conta)                          | ✅                     | ❌ Rota mencionada no menu, não criada | M       |

### 🟡 Média Prioridade

| Feature                                                               | Vody.gg                     | Vod.TV                                          | Esforço |
| --------------------------------------------------------------------- | --------------------------- | ----------------------------------------------- | ------- |
| **My Journey** (gamificação: XP, níveis, conquistas, streaks, badges) | ✅ Item de menu dedicado    | ❌ Não existe                                   | XL      |
| **Notificações funcionais** (Bell com lógica real)                    | ✅                          | ⚠️ Botão existe, sem lógica                     | M       |
| **Playlists no canal** (tab Playlists funcional)                      | ✅ Tab presente e funcional | ⚠️ Tab existe na UI, sem backend                | L       |
| **Termos de Serviço** `/terms`                                        | ✅ Página dedicada          | ❌ Não existe                                   | S       |
| **Diretrizes da Comunidade** `/guidelines`                            | ✅ Página dedicada          | ⚠️ Link no sidebar, sem rota real               | S       |
| **Direitos Autorais / DMCA** `/copyright`                             | ✅ Página dedicada          | ⚠️ Link no sidebar, sem rota real               | S       |
| **Sidebar Expandir/Recolher funcional**                               | ✅                          | ⚠️ Botão existe, sem lógica                     | S       |
| **Home dedicada para usuário logado**                                 | ✅ (conteúdo personalizado) | ⚠️ Mesma page pública serve logado e não-logado | M       |

### 🟢 Baixa Prioridade

| Feature                                                  | Vody.gg | Vod.TV                       | Esforço |
| -------------------------------------------------------- | ------- | ---------------------------- | ------- |
| **Tema / Idioma funcional**                              | ✅      | ⚠️ Items no menu, sem lógica | M       |
| **Sidebar "Mostrar Mais"** (canais seguidos expandíveis) | ✅      | ⚠️ Botão existe, sem lógica  | S       |
| **Discord integrado** (link na sidebar)                  | ✅      | ✅ Já existe                 | —       |
| **Integração de pagamento real** (assinar canal)         | ✅      | ⚠️ UI pronta, sem integração | XL      |

---

## Features onde o Vod.TV é superior ou equivalente

- **Arquitetura técnica**: Next.js 16 App Router com Server Components, `@supabase/ssr`, route groups `(auth)/` e `(public)/` — mais moderno que a maioria dos concorrentes
- **Design system semântico**: tokens Tailwind customizados, tipografia Geist + Plus Jakarta Sans — mais refinado visualmente
- **Schema de banco completo**: 8 migrations cobrindo profiles, referrals, affiliates, gamification-ready (estrutura existe, só falta UI)
- **Fluxo de afiliados**: formulário de candidatura com Server Action — o Vody.gg não exibe isso publicamente
- **Referrals**: sistema de indicações implementado — diferencial competitivo real

---

## Recomendação para o próximo ciclo SDD

### Ciclo 1 — Conectar o que já existe (alta prioridade, baixo esforço)

Transformar UI sem backend em features reais:

1. **Follow funcional** — Server Action escrevendo na tabela `follows`, sidebar dinâmica refletindo o estado
2. **Curtir funcional** — Server Action escrevendo em `video_likes`
3. **Incremento de views** — trigger ou Server Action chamado ao assistir
4. **Sidebar Expandir/Recolher** — `useState` no Client Component

Justificativa: são todas features que o Vody já tem funcionando. O Vod.TV tem a UI pronta — é só conectar o backend. Impacto alto, esforço baixo, nenhum risco de arquitetura.

### Ciclo 2 — Fechar as rotas ausentes (média prioridade)

- `/profile` — página de perfil do usuário (dados do Supabase Auth)
- `/settings` — preferências de conta (tema, idioma, notificações)
- `/terms`, `/guidelines`, `/copyright` — páginas de conteúdo estático
- **Search funcional** — query full-text no Supabase contra `videos.title` + `channels.name`

### Ciclo 3 — Novas seções de descoberta (diferenciação)

- **Categories** — nova tabela `categories`, vínculo com `videos`, página de browsing
- **Lives** — flag `is_live` em `videos` ou nova tabela `live_sessions`, seção dedicada

### Ciclo 4 — My Journey / Gamificação (alto impacto, alto esforço)

Sistema completo de XP, níveis, conquistas e streaks diários. Requer:

- Tabelas: `user_xp`, `achievements`, `user_achievements`, `daily_streaks`
- Triggers no Supabase para eventos (assistiu vídeo, curtiu, seguiu canal, etc.)
- Página `/journey` dedicada
- Componente de progresso exibido no perfil/header

Este ciclo sozinho pode ser o maior diferencial do Vod.TV frente ao Vody se executado com qualidade — o "My Journey" do Vody existe mas não é amplamente divulgado como feature central.
