# Hermes Agent — Tasks Configuradas

> Configure estas tasks no Hermes Agent via CLI ou Telegram.
> Hermes escreve os outputs em `vault/Research/Weekly/`.

---

## Tasks Semanais (toda segunda-feira)

### 1. Monitor Vody.gg
```
Acesse vody.gg e as páginas /tteuw, /beliene. 
Documente qualquer feature nova, mudança de UI, ou funcionalidade que não existia semana passada.
Salve em vault/Research/Weekly/YYYY-MM-DD-vody-monitor.md
```

### 2. Dependências — Changelogs
```
Verifique os changelogs de:
- hls.js (github.com/video-dev/hls.js/releases)
- @supabase/supabase-js (github.com/supabase/supabase-js/releases)
- next (github.com/vercel/next.js/releases)
- @aws-sdk/client-s3 (últimas releases)

Resuma apenas breaking changes e features relevantes para um projeto de streaming/VOD.
Salve em vault/Research/Weekly/YYYY-MM-DD-deps-changelog.md
```

### 3. Concorrentes Brasileiros — Radar
```
Pesquise por plataformas brasileiras de VOD/streaming para criadores lançadas ou atualizadas 
nos últimos 7 dias. Foco: monetização, features exclusivas, crescimento.
Salve em vault/Research/Weekly/YYYY-MM-DD-market-radar.md
```

---

## Tasks Mensais (todo dia 1)

### 4. Twitch API — Novidades
```
Verifique dev.twitch.tv/docs/change-log pelo último mês.
Documente mudanças em: EventSub, webhooks, stream endpoints, auth.
Relevante para o worker de lives do Vod.TV.
Salve em vault/Research/Monthly/YYYY-MM-twitch-api.md
```

### 5. Cloudflare R2 — Updates
```
Verifique blog.cloudflare.com e developers.cloudflare.com/r2/changelog
pelo último mês. Documente: preços, limites, novas features de storage/streaming.
Salve em vault/Research/Monthly/YYYY-MM-r2-updates.md
```

---

## Tasks On-Demand (rodar quando necessário)

### 6. Deep Dive em Feature
```
Prompt base: "Faça um deep dive na feature [X] de [concorrente].
Como funciona? Qual é a UX exata? Como implementariam no Vod.TV?
Referências técnicas, bibliotecas usadas, benchmarks."
Salve em vault/Research/Features/[feature-name].md
```

### 7. Research de Biblioteca
```
Prompt base: "Avalie as melhores opções para [problema técnico] em um projeto 
Next.js 16 + Supabase. Compare: performance, manutenção, bundle size, DX.
Recomende uma com justificativa."
Salve em vault/Research/Tech/[topic].md
```

---

## Convenção de Output

Todo arquivo gerado pelo Hermes deve ter este frontmatter:

```yaml
---
source: hermes-agent
date: YYYY-MM-DD
task: [nome da task]
status: draft | reviewed
---
```
