# AGENTS.md — Sessão 10 (Clínica Daniandrade)

Projeto estático (Vanilla JS, HTML5, CSS3). Sem build, sem dependências, sem package manager.

## Executar
Abra `index.html` em qualquer navegador moderno.

## Script load order (index.html)
Dependência importa porque módulos sobrescrevem funções globais:
1. `@supabase/supabase-js` (CDN) — cria `window.supabase`
2. `js/core/supabase-config.js` — `SUPABASE_CONFIG` (URL + anonKey)
3. `js/core/supabase.js` — `supabaseClient`, `supabaseSync()`, `supabaseSalvar()`
4. `js/core/auth.js` — `AppAuth` (login/signup/logout via Supabase Auth)
5. `js/core/storage.js` — AppStorage global
6. `js/modules/clientes.js` — define `abrirPopover`, `cadastrarCliente`, etc.
7. `js/utils/masks.js` — input masks via listeners
8. `js/utils/formatters.js` — `parseMoeda`, `formatMoeda`
9. `js/modules/infoCliente.js` — **sobrescreve** `abrirPopover()` de clientes.js (intencional)
10. `js/modules/sessoes.js` — hoje/calendário/histórico
11. `js/modules/dashboard.js` — financeiro
12. `js/modules/modal.js` — modal de cancelamento
13. `js/main.js` — inicialização (`DOMContentLoaded`)

## Autenticação (Supabase Auth)
- `AppAuth` (`js/core/auth.js`) gerencia login/signup/logout.
- Na inicialização, `AppAuth.init()` verifica sessão existente. Se não houver sessão, exibe a tela de login e bloqueia o app.
- App inteiro (`initApp()`) só é chamado após autenticação bem-sucedida.
- Botão "Sair" no header faz logout via `supabaseClient.auth.signOut()`.
- RLS policies no Supabase restringem acesso a `authenticated` — a anon key pública não permite operações sem login.
- **Importante:** No Supabase Dashboard, vá em Authentication > Settings e desabilite "Confirm email" para evitar limite de envio de emails durante testes.

## Regras de estado
- **Nunca acesse `localStorage` diretamente.** Use sempre `AppStorage.salvarDados()` e `AppStorage.carregarDados()`.
- `salvarDados()` persiste em localStorage + Supabase (assíncrono, fire-and-forget).
- `carregarDados()` carrega de localStorage (síncrono). `carregarDadosRemoto()` carrega do Supabase em background.
- Estado centralizado em `AppStorage.clientes` e `AppStorage.sessoes`.
- Para configurar Supabase: preencha `js/core/supabase-config.js` com URL e anonKey do projeto, e execute `supabase-schema.sql` no SQL Editor do Supabase.

## Convenções de dados
- Telefone: mínimo 14 caracteres (com máscara) para ser válido.
- CPF: mínimo 14 caracteres quando preenchido.
- CEP: mínimo 9 caracteres quando preenchido.
- Status possíveis de sessão: `pendente`, `andamento`, `concluida`, `cancelada`, `agendada`, `ativo`.
- Sessão de pacote (`tipo: 'pacote'`) rastreia `sessoesRealizadas` e `totalSessoes`.
- Ao **excluir cliente**, sessões passadas/em andamento são preservadas; apenas futuras são removidas.
- A sessão possui apenas um campo `status` (valores: `pendente`, `andamento`, `concluida`, `cancelada`, `agendada`, `ativo`). O campo `finalizada` foi removido.

## Dashboard e UI
- Dashboard re-renderiza a cada 10 segundos (via `setInterval` em `main.js`).
- Relógio na header bate a cada 1 segundo e re-renderiza sessões de hoje.
- Botão "Cancelar sessão" abre modal em `modal.js` (a função `cancelarSessao` comentada em `clientes.js` não é usada).
