# AGENTS.md — Plano de Gestão (Clínica Daniandrade)

Projeto estático (Vanilla JS, HTML5, CSS3). Sem build, sem dependências, sem package manager.

## Executar
Abra `index.html` em qualquer navegador moderno.

## Script load order (index.html)
Dependência importa porque módulos sobrescrevem funções globais:
1. `js/core/storage.js` — AppStorage global
2. `js/modules/clientes.js` — define `abrirPopover`, `cadastrarCliente`, etc.
3. `js/utils/masks.js` — input masks via listeners
4. `js/utils/formatters.js` — `parseMoeda`, `formatMoeda`
5. `js/modules/infoCliente.js` — **sobrescreve** `abrirPopover()` de clientes.js (intencional)
6. `js/modules/sessoes.js` — hoje/calendário/histórico
7. `js/modules/dashboard.js` — financeiro
8. `js/modules/modal.js` — modal de cancelamento
9. `js/main.js` — inicialização (`DOMContentLoaded`)

## Regras de estado
- **Nunca acesse `localStorage` diretamente.** Use sempre `AppStorage.salvarDados()` e `AppStorage.carregarDados()`.
- Estado centralizado em `AppStorage.clientes` e `AppStorage.sessoes`.
- Toda sessão existe tanto no array global `AppStorage.sessoes` quanto em `cliente.sessoes`. Ambos devem ser atualizados.

## Convenções de dados
- Telefone: mínimo 14 caracteres (com máscara) para ser válido.
- CPF: mínimo 14 caracteres quando preenchido.
- CEP: mínimo 9 caracteres quando preenchido.
- Status possíveis de sessão: `pendente`, `andamento`, `concluida`, `cancelada`, `agendada`, `ativo`.
- Sessão de pacote (`tipo: 'pacote'`) rastreia `sessoesRealizadas` e `totalSessoes`.
- Ao **excluir cliente**, sessões passadas/em andamento são preservadas; apenas futuras são removidas.
- `storage.js` contém reparo de dados corrompidos por refatoração anterior (`AppStorage.sessoes` → `sessoes`). Não remover.

## Dashboard e UI
- Dashboard re-renderiza a cada 10 segundos (via `setInterval` em `main.js`).
- Relógio na header bate a cada 1 segundo e re-renderiza sessões de hoje.
- Botão "Cancelar sessão" abre modal em `modal.js` (a função `cancelarSessao` comentada em `clientes.js` não é usada).
