# Skill: Competitive Analysis → Gap Report

Analisa sites concorrentes, mapeia features existentes, compara com o estado atual do projeto e gera um relatório de gaps priorizado pronto para virar PRD.md no fluxo SDD.

---

## Quando usar esta skill

- Antes de iniciar um ciclo SDD (Research → Spec → Code)
- Quando o usuário pedir análise de concorrente, "o que o X tem que a gente não tem", ou mapeamento de features
- Quando precisar identificar próximas features com base em referências de mercado

Trigger phrases: "analisa o site X", "o que o concorrente tem", "mapeie as features de Y", "gap analysis", "competitive analysis"

---

## Pré-requisitos

O projeto deve ter um arquivo `project-state.md` (ou equivalente) na raiz descrevendo as features já implementadas. Se não existir, peça ao usuário para criá-lo ou gere um com base nos arquivos existentes no repo antes de continuar.

Formato mínimo do `project-state.md`:
```
## Features implementadas
- [área] feature: descrição breve
...

## Features parcialmente implementadas
- [área] feature: o que falta

## Backlog conhecido
- ...
```

---

## Workflow passo a passo

### Etapa 1 — Scraping do concorrente

Use `web_fetch` para buscar o HTML das páginas principais do site concorrente:
- Home (público)
- Home (autenticado, se possível simular)
- Página de canal/perfil
- Página de vídeo/watch
- Página de categorias
- Página de notificações (se visível)
- Página de pricing/planos (se existir)

Para cada página, extraia:
- Elementos de navegação (sidebar, header, tabs)
- Seções e blocos visíveis
- CTAs e fluxos de ação disponíveis
- Labels, textos de UI (revelam features mesmo sem código)
- URLs mencionadas (revelam rotas/features ocultas)

Se o site bloquear scraping direto, use `web_search` com queries como:
- `site:[domínio] features`
- `"[nome do site]" features changelog`
- `"[nome do site]" como funciona`

### Etapa 2 — Categorização de features

Organize todas as features encontradas nas seguintes categorias:

```
## [NOME DO CONCORRENTE] — Feature Map

### Descoberta de Conteúdo
- feature: descrição

### Player & Watch Experience
- feature: descrição

### Canais & Criadores
- feature: descrição

### Engajamento Social
- feature: descrição

### Gamificação & Retenção
- feature: descrição

### Monetização
- feature: descrição

### Notificações
- feature: descrição

### Busca & Filtros
- feature: descrição

### Onboarding & Auth
- feature: descrição

### Admin / Criador Dashboard
- feature: descrição

### Mobile / PWA
- feature: descrição
```

### Etapa 3 — Leitura do estado atual do projeto

Leia o `project-state.md` do projeto. Se não existir, rode:

```bash
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".next" | head -60
```

E infira as features implementadas pela estrutura de arquivos e rotas existentes.

### Etapa 4 — Gap Analysis

Para cada feature do concorrente, classifique:

| Status | Significado |
|--------|-------------|
| `✅ EXISTE` | Implementado no projeto |
| `⚠️ PARCIAL` | Existe mas incompleto |
| `❌ FALTA` | Não existe |
| `🚫 FORA DE ESCOPO` | Não faz sentido para o projeto |

### Etapa 5 — Geração do relatório

Gere o arquivo `competitive-gaps.md` com a seguinte estrutura:

```markdown
# Competitive Gap Analysis
> Concorrente analisado: [nome] ([url])
> Projeto: [nome do projeto]
> Data: [data]

## Resumo executivo
[2-3 frases sobre o posicionamento geral do concorrente vs o projeto]

## Gaps por prioridade

### 🔴 Alta prioridade (impacto direto em retenção/conversão)
| Feature | Concorrente | Projeto | Esforço estimado |
|---------|------------|---------|-----------------|
| ...     | ✅          | ❌       | M               |

### 🟡 Média prioridade (diferenciação)
| Feature | Concorrente | Projeto | Esforço estimado |
|---------|------------|---------|-----------------|

### 🟢 Baixa prioridade (nice-to-have)
| Feature | Concorrente | Projeto | Esforço estimado |
|---------|------------|---------|-----------------|

## Features onde o projeto é superior
[Lista do que o projeto tem que o concorrente não tem ou faz pior]

## Recomendação de próximo ciclo SDD
[Feature ou conjunto de features recomendado para o próximo PRD.md, com justificativa]
```

**Critérios de prioridade:**
- Alta: impacta diretamente retenção, engajamento ou receita
- Média: melhora experiência ou diferencia do concorrente
- Baixa: polish, edge cases, funcionalidades avançadas

**Estimativa de esforço:**
- S = menos de 1 dia
- M = 1-3 dias
- L = 1 semana
- XL = mais de 1 semana

---

## Output final

1. Salvar `competitive-gaps.md` na raiz do projeto
2. Atualizar `project-state.md` se novas features do projeto foram descobertas durante o processo
3. Perguntar ao usuário: "Quer que eu gere o PRD.md para o próximo ciclo SDD com base neste gap analysis?"

Se confirmado, inicie a Etapa 1 do SDD com o gap analysis como contexto, gerando o `PRD.md` focado nas features de alta prioridade.

---

## Exemplo de uso

```
# Prompt para acionar a skill:
Analisa o site vody.gg e compara com o Vod.TV. Quero saber quais features eles têm que a gente ainda não implementou.
```

```
# O Claude Code deve responder algo como:
Vou rodar a skill de competitive analysis. Primeiro vou verificar se existe um project-state.md no repo...
[busca o arquivo]
[faz scraping do vody.gg]
[gera o competitive-gaps.md]
Relatório gerado em competitive-gaps.md. As 3 features de maior prioridade identificadas foram: [X, Y, Z]. Quer que eu gere o PRD.md para o próximo ciclo?
```

---

## Notas

- Se o site bloquear acesso automatizado, documente quais páginas foram acessíveis e quais não foram
- Para sites que requerem login, analise o que for público + use changelogs, tweets, vídeos de demo ou documentação oficial como fonte secundária
- Sempre marcar `🚫 FORA DE ESCOPO` explicitamente — evita que features irrelevantes entrem no backlog
- Esta skill é a entrada natural para o fluxo SDD. O `competitive-gaps.md` gerado é o input para o prompt de Research.
