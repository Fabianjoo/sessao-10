# AGENTS.md — Sessão 10 (Clínica Daniandrade)

Projeto estático (Vanilla JS, HTML5, CSS3). Sem build, sem dependências, sem package manager.

## Executar
Abra `index.html` em qualquer navegador moderno.

## Script load order (index.html)
Dependência importa porque módulos sobrescrevem funções globais:
1. `@supabase/supabase-js` (CDN) — cria `window.supabase`
2. `js/core/supabase-config.js` — `SUPABASE_CONFIG` (URL + anonKey)
3. `js/core/supabase.js` — `supabaseClient`, `supabaseSync()`, `supabaseSalvar()`
4. `js/core/auth.js` — `AppAuth` (login/signup/forgot-password/logout via Supabase Auth)
5. `js/core/storage.js` — AppStorage global (clientes, sessoes, pagamentos)
6. `js/modules/clientes.js` — define `abrirPopover`, `cadastrarCliente`, etc.
7. `js/utils/masks.js` — input masks via listeners
8. `js/utils/formatters.js` — `parseMoeda`, `formatMoeda`
9. `js/modules/infoCliente.js` — **sobrescreve** `abrirPopover()` de clientes.js (intencional) — exibe info do cliente + abas de sessões avulsas, pacotes e pagamentos
10. `js/modules/sessoes.js` — hoje/calendário/histórico
11. `js/modules/dashboard.js` — financeiro (inclui receita de pagamentos de pacotes)
12. `js/modules/modal.js` — modal de cancelamento
13. `js/utils/cep.js` — busca automática de endereço via ViaCEP
14. `js/main.js` — inicialização (`DOMContentLoaded`)

## Autenticação (Supabase Auth)
- `AppAuth` (`js/core/auth.js`) gerencia login/signup/logout/forgot-password via Supabase Auth.
- Na inicialização, `AppAuth.init()` verifica sessão existente. Se não houver sessão, exibe a tela de login e bloqueia o app.
- O fluxo de **"Esqueci minha senha"** envia email via `supabaseClient.auth.resetPasswordForEmail()`. O evento `PASSWORD_RECOVERY` é capturado em `onAuthStateChange` para exibir o formulário de nova senha.
- O link de recovery é detectado via `window.location.hash` com parâmetro `type=recovery` **antes** do Supabase processar o hash, prevenindo race conditions.
- Um **guard** impede que `SIGNED_IN` inicialize o app durante o fluxo de recovery (auto-login prevenido).
- Após atualizar a senha, `getSession()` + `onAuth()` é chamado explicitamente porque `SIGNED_IN` dispara dentro de `updateUser()` enquanto `isPasswordRecovery` ainda é `true`, fazendo o guard pular o evento.
- App inteiro (`initApp()`) só é chamado após autenticação bem-sucedida.
- Botão "Sair" no header faz logout via `supabaseClient.auth.signOut()`.
- RLS policies no Supabase restringem acesso a `authenticated` — a anon key pública não permite operações sem login.
- **Importante:** No Supabase Dashboard, vá em Authentication > Settings e desabilite "Confirm email" para evitar limite de envio de emails durante testes.

## Regras de estado
- **Nunca acesse `localStorage` diretamente.** Use sempre `AppStorage.salvarDados()` e `AppStorage.carregarDados()`.
- `salvarDados()` persiste em localStorage + Supabase (assíncrono, fire-and-forget). Usa `Promise.allSettled` — falha em uma tabela não trava as outras.
- `supabaseSync()` normaliza **case das colunas** (lowercase no upsert, mapeamento camelCase no recebimento) e inclui registros legados **sem `user_id`** no sync.
- `carregarDados()` carrega de localStorage (síncrono). `carregarDadosRemoto()` carrega do Supabase em background.
- Estado centralizado em `AppStorage.clientes`, `AppStorage.sessoes` e `AppStorage.pagamentos`.
- Para configurar Supabase: preencha `js/core/supabase-config.js` com URL e anonKey do projeto, e execute `supabase-schema.sql` no SQL Editor do Supabase.

## Convenções de dados
- Telefone: mínimo 14 caracteres (com máscara) para ser válido.
- CPF: mínimo 14 caracteres quando preenchido.
- CEP: mínimo 9 caracteres quando preenchido.
- Status possíveis de sessão: `pendente`, `andamento`, `concluida`, `cancelada`, `agendada`, `ativo`.
- Sessão de pacote (`tipo: 'pacote'`) rastreia `sessoesRealizadas` e `totalSessoes`.
- Ao **excluir cliente**, sessões passadas/em andamento são preservadas; apenas futuras são removidas.
- A sessão possui apenas um campo `status` (valores: `pendente`, `andamento`, `concluida`, `cancelada`, `agendada`, `ativo`). O campo `finalizada` foi removido.
- **Pagamentos de pacote** são armazenados em `AppStorage.pagamentos` com `pacoteId`, `clienteId`, `valor`, `data`, `obs`. O dashboard inclui receita de pagamentos no cálculo financeiro.
- **Cancelar sessão de pacote** decrementa `sessoesRealizadas` do pacote, permitindo remarcar.
- **Busca de clientes** na lista filtra por nome, telefone, CEP e CPF simultaneamente.

## Dashboard e UI
- Dashboard re-renderiza a cada 10 segundos (via `setInterval` em `main.js`).
- Relógio na header bate a cada 1 segundo e re-renderiza sessões de hoje.
- Sessões concluídas recebem estilo verde (`sessao-concluida`) na lista de hoje e no histórico.
- **Calendário** exibe todas as sessões independente de status, com distinção visual (cor, strikethrough) para não-ativas. Itens do calendário têm botão **"Confirmar sessão"**.
- Grid layout usa `grid-template-areas` explícito para seções responsivas.
- Botão "Cancelar sessão" abre modal em `modal.js` (a função `cancelarSessao` comentada em `clientes.js` não é usada).
