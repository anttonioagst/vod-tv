# Vod.TV — Brain

> Vault aberto na raiz do projeto. Todos os `.md` do projeto são notas nativas aqui.
> Última atualização: 2026-04-04

---

## Produto

| Doc | Descrição |
|-----|-----------|
| [[PRD]] | Sistema de Lives + Video Player (HLS + Worker) |
| [[PRD-ciclo1]] | Ciclo 1: Follow, Like, Views, Sidebar collapse |
| [[PRD-auth]] | Autenticação Supabase |
| [[PRD-supabase-data]] | Schema e queries |
| [[COMPETITIVE_GAPS]] | Análise vs Vody.gg |

## Design & Spec

| Doc | Descrição |
|-----|-----------|
| [[DESIGN_AUDIT]] | Audit de design vs Figma |
| [[AUDIT]] | Audit geral |
| [[Spec]] | Especificação técnica geral |
| [[Spec-supabase-auth]] | Spec auth Supabase |
| [[Spec-supabase-data]] | Spec dados Supabase |
| [[CLAUDE]] | Instruções do Claude Code (componentes, tokens, workflow) |

## Estado atual do projeto

- **Stack:** Next.js 16 (App Router) + TypeScript + Tailwind + Supabase + Cloudflare R2
- **Deploy:** Vercel
- **Fase atual:** Ciclo 1 concluído (Follow, Like, Views) → Lives em andamento (Worker + HLS Player)
- **Concorrente principal:** Vody.gg — gap em Lives, Gamificação, Categories
- **Figma:** https://www.figma.com/design/2gbD3wnO3AaeyYnLMeyOUL/Vod.TV

## Workflow de IA

| Agente | Papel | Escreve em |
|--------|-------|-----------|
| **Hermes Agent** | Research assíncrono, monitoramento, tasks agendadas | [[vault/Research/]] |
| **Claude Code** | Implementação, código, review | `memory/`, código |
| **Obsidian** | Cérebro compartilhado, indexa tudo | este vault |

- [[vault/Agentes/Hermes Tasks]] — tasks configuradas no Hermes
- [[vault/Agentes/Claude Code Context]] — instruções e contexto para Claude Code

## Research recente

- [[vault/Research/Weekly/]] — outputs semanais do Hermes
- [[COMPETITIVE_GAPS]] — análise Vody.gg (04/04/2026)

## Backlog

- [[vault/Backlog/Features]] — features identificadas, não priorizadas
- [[vault/Decisoes/]] — Architecture Decision Records (ADRs)
