# Extrato de Pagamentos para Pacotes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow manual payment registration per package and show only received payments in the financial dashboard (cash basis).

**Architecture:** New `AppStorage.pagamentos[]` array persisted in localStorage + Supabase. Dashboard sums `pagamentos` by date instead of `pacote.valor` by `dataCadastro`. Package cards in the client popover display total/pago/saldo with inline form to register payments.

**Tech Stack:** Vanilla JS, HTML5, CSS3, Supabase.

**Spec:** `docs/superpowers/specs/2026-06-12-pagamentos-pacote-design.md`

---

### Task 1: Persistência — Schema SQL + Storage + Supabase Sync

**Files:**
- Modify: `supabase-schema.sql`
- Modify: `js/core/storage.js`
- Modify: `js/core/supabase.js`
- Modify: `js/core/auth.js`

- [ ] **Step 1: Add `pagamentos` table to schema**

Add after the `sessoes` table block in `supabase-schema.sql` (before the index section):

```sql
-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  pacote_id BIGINT NOT NULL,
  cliente_id BIGINT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  data TEXT NOT NULL,
  obs TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_pacote_id ON pagamentos(pacote_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data);
```

Add RLS after existing RLS section:

```sql
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios pagamentos" ON pagamentos;
CREATE POLICY "Usuários podem ver apenas seus próprios pagamentos" ON pagamentos
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

Add trigger after existing triggers:

```sql
DROP TRIGGER IF EXISTS set_pagamentos_updated_at ON pagamentos;
CREATE TRIGGER set_pagamentos_updated_at
  BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

- [ ] **Step 2: Add `pagamentos` to `storage.js`**

Add `pagamentos: [],` after `sessoes: [],` on line 4.

Add `localStorage.setItem('pagamentos', JSON.stringify(this.pagamentos));` in `salvarDadosLocal()` after line 15.

Add `const p = localStorage.getItem('pagamentos');` in `carregarDados()` after line 26. Append:
```javascript
try { if (p) this.pagamentos = JSON.parse(p); } catch (e) { this.pagamentos = []; }
```

- [ ] **Step 3: Add `pagamentos` to `supabase.js` sync**

In `supabaseSync()` (line 49), add `pagamentos` to the `Promise.all`:
```javascript
const { data: pagamentos } = await supabaseClient.from('pagamentos').select('*').eq('user_id', AppStorage.currentUserId)
```

After the `sessoes` merge block (line 70), add:
```javascript
if (pagamentos) {
  const { records, changed } = mergeRecords(AppStorage.pagamentos, pagamentos);
  if (changed) {
    AppStorage.pagamentos = records;
    precisaRenderizar = true;
  }
}
```

In `supabaseSalvar()` (line 138), add to `Promise.all`:
```javascript
syncTableSupabase('pagamentos', AppStorage.pagamentos)
```

- [ ] **Step 4: Clear `pagamentos` on logout in `auth.js`**

In `showLogin()` (line 122), add `AppStorage.pagamentos = [];` after `AppStorage.sessoes = [];`.

In `logout()` (line 137), add `AppStorage.pagamentos = [];` after `AppStorage.sessoes = [];`.

(No change in `onAuth` — matches existing pattern where clientes/sessoes are also not cleared there.)

---

### Task 2: Dashboard — Regime de Caixa

**Files:**
- Modify: `js/modules/dashboard.js`

- [ ] **Step 5: Replace pacote revenue sum with pagamentos sum**

In `renderDashboard()`, delete lines 14-16 (pacotesDoDia/pacotesDoMes) and replace lines 18-22 with:

```javascript
const pagamentosHoje = AppStorage.pagamentos.filter(p => p.data === hojeStr);
const pagamentosMes = AppStorage.pagamentos.filter(p => p.data.startsWith(mesStr));

const receitaDia = hoje.reduce((a, s) => a + parseMoeda(s.valor), 0)
                 + pagamentosHoje.reduce((a, p) => a + p.valor, 0);
const receitaMes = doMes.reduce((a, s) => a + parseMoeda(s.valor), 0)
                 + pagamentosMes.reduce((a, p) => a + p.valor, 0);
```

---

### Task 3: Popover do Cliente — Extrato de Pagamentos

**Files:**
- Modify: `js/modules/infoCliente.js`

- [ ] **Step 6: Update pacote card template with total/pago/saldo and action buttons**

In `abrirPopover()`, inside the pacote map (line 33), compute payment data per package. After `const pct` (line 36), add:

```javascript
const pagamentosDoPacote = AppStorage.pagamentos.filter(pg => pg.pacoteId === p.id);
const totalPagoPacote = pagamentosDoPacote.reduce((a, pg) => a + pg.valor, 0);
const saldoPacote = parseMoeda(p.valor) - totalPagoPacote;
const hojeStrLoc = new Date().toISOString().slice(0, 10);
```

Replace the existing `<p>💰 ${p.valor}</p>` (line 51) with:

```javascript
<p>💰 Total: ${p.valor} | 💳 Pago: ${formatMoeda(totalPagoPacote)} | ⏳ Saldo: ${formatMoeda(saldoPacote)}</p>
<div class="sessao-acoes" style="display:flex;gap:4px;flex-wrap:wrap">
  <button type="button" onclick="mostrarFormPagamento(${cliente.id}, ${p.id})">💳 Registrar Pagamento</button>
  <button type="button" onclick="toggleExtrato(${p.id})">📋 Extrato (${pagamentosDoPacote.length})</button>
</div>
<div id="form-pagamento-${p.id}" style="display:none;margin-top:8px">
  <label style="font-size:13px">Valor</label>
  <input id="pag-valor-${p.id}" oninput="mascaraValor(this)" style="width:100%">
  <label style="font-size:13px;margin-top:6px">Data</label>
  <input id="pag-data-${p.id}" type="date" value="${hojeStrLoc}" style="width:100%">
  <label style="font-size:13px;margin-top:6px">Observação</label>
  <textarea id="pag-obs-${p.id}" style="width:100%" rows="2"></textarea>
  <div style="display:flex;gap:4px;margin-top:6px">
    <button type="button" onclick="salvarPagamento(${cliente.id}, ${p.id})">💾 Salvar</button>
    <button type="button" onclick="cancelarFormPagamento(${p.id})">✖ Cancelar</button>
  </div>
</div>
<div id="extrato-${p.id}" style="display:none;margin-top:8px;font-size:13px;background:#f9f7f4;padding:8px;border-radius:6px">
  <strong>📋 Extrato — ${p.servico}</strong>
  ${pagamentosDoPacote.length > 0
    ? pagamentosDoPacote
        .sort((a, b) => a.data.localeCompare(b.data))
        .map(pg => `<p style="margin:4px 0">${pg.data} — ${formatMoeda(pg.valor)}${pg.obs ? ' — ' + pg.obs : ''}</p>`)
        .join('')
        + `<hr style="margin:6px 0"><p><strong>Total pago:</strong> ${formatMoeda(totalPagoPacote)} | <strong>Saldo:</strong> ${formatMoeda(saldoPacote)}</p>`
    : '<p style="margin:4px 0">Nenhum pagamento registrado.</p>'}
</div>
```

- [ ] **Step 7: Add global handler functions at end of file**

Append after line 153 (end of file):

```javascript
function mostrarFormPagamento(clienteId, pacoteId) {
  const form = document.getElementById('form-pagamento-' + pacoteId);
  if (form) form.style.display = 'block';
}

function cancelarFormPagamento(pacoteId) {
  const form = document.getElementById('form-pagamento-' + pacoteId);
  if (form) form.style.display = 'none';
}

function salvarPagamento(clienteId, pacoteId) {
  const valorInput = document.getElementById('pag-valor-' + pacoteId);
  const dataInput = document.getElementById('pag-data-' + pacoteId);
  const obsInput = document.getElementById('pag-obs-' + pacoteId);
  if (!valorInput || !dataInput) return;

  const valorNumerico = parseMoeda(valorInput.value);
  if (!valorInput.value || valorNumerico <= 0) {
    alert('Informe um valor válido.');
    valorInput.focus();
    return;
  }

  AppStorage.pagamentos.push({
    id: Date.now(),
    pacoteId: pacoteId,
    clienteId: clienteId,
    valor: valorNumerico,
    data: dataInput.value,
    obs: obsInput ? obsInput.value.trim() : '',
    user_id: AppStorage.currentUserId || ''
  });

  AppStorage.salvarDados();

  const cliente = AppStorage.clientes.find(c => c.id === clienteId);
  if (cliente) abrirPopover(cliente);
}

function toggleExtrato(pacoteId) {
  const el = document.getElementById('extrato-' + pacoteId);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

window.mostrarFormPagamento = mostrarFormPagamento;
window.cancelarFormPagamento = cancelarFormPagamento;
window.salvarPagamento = salvarPagamento;
window.toggleExtrato = toggleExtrato;
```
