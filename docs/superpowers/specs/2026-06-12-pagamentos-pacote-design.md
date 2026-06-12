# Extrato de Pagamentos para Pacotes

## Problema

O valor integral do pacote (`pacote.valor`) era somado automaticamente no dashboard
financeiro na data de cadastro (`dataCadastro`). Isso não reflete a realidade: clientes
pagam pacotes de formas variadas — entrada + saldo, por sessão, mensalmente, etc.

## Decisão

Regime de **caixa**: o dashboard soma apenas o que foi efetivamente recebido.
Pagamentos são registrados manualmente um a um, vinculados ao pacote.

## Estrutura de dados

Novo array em `AppStorage`:

```javascript
{
  id: Date.now(),             // único
  pacoteId: 1718200000001,    // FK para o pacote em AppStorage.sessoes
  clienteId: 1718190000000,   // desnormalizado
  valor: 500,                 // Number, sem máscara
  data: "2026-06-12",         // data do recebimento
  obs: "Entrada do pacote",   // opcional
  user_id: "uuid"             // do Supabase Auth
}
```

Persistência em localStorage (`pagamentos` key) + Supabase (tabela `pagamentos`).

## Supabase

Nova tabela:

```sql
CREATE TABLE pagamentos (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  pacote_id BIGINT NOT NULL,
  cliente_id BIGINT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  data TEXT NOT NULL,
  obs TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê próprio" ON pagamentos
  FOR ALL USING (auth.uid() = user_id);
```

Incluir no sync (`supabase.js`) — mesmo padrão de `clientes` e `sessoes`.

## AppStorage

- `pagamentos: []` — novo array
- `salvarDadosLocal()`: incluir `pagamentos` no `setItem`
- `carregarDados()`: incluir `pagamentos` no `JSON.parse`

## Popover do cliente — aba Pacotes (`infoCliente.js`)

Cada card de pacote exibe:

```
💰 Total: R$ 1.500 | 💳 Pago: R$ 500 | ⏳ Saldo: R$ 1.000
  [💳 Registrar Pagamento] [📋 Extrato]
```

- **Total**: `pacote.valor` (já existe, string mascarada)
- **Pago**: soma de `pagamentos` onde `pagamento.pacoteId === pacote.id`
- **Saldo**: `parseMoeda(pacote.valor) - pagos`

### Registrar Pagamento

Formulário inline no card:

```
Valor: [R$ ______]   (input com mascaraValor)
Data:  [12/06/2026]  (input type="date", default hoje)
Obs:   [___________] (textarea opcional, placeholder opcional)
[💾 Salvar] [✖️ Cancelar]
```

Ao salvar: cria objeto, push em `AppStorage.pagamentos`, `AppStorage.salvarDados()`, re-renderiza popover.

### Extrato

Lista de pagamentos do pacote ordenada por data:

```
📋 Extrato de pagamentos — Pacote Facial
12/06/2026 — R$ 500,00 — Entrada do pacote
15/06/2026 — R$ 300,00 — Pagamento por sessão
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total pago: R$ 800,00 | Saldo: R$ 700,00
```

Expansão inline no card (toggle): um clique em "Extrato" revela/esconde a lista abaixo do card.

## Dashboard (`dashboard.js`)

Substituir:

```javascript
// ANTES
const receitaDia = avulsasHoje + pacotesDoDia
const receitaMes = avulsasMes + pacotesDoMes

// DEPOIS
const pagHoje = AppStorage.pagamentos.filter(p => p.data === hojeStr)
const pagMes  = AppStorage.pagamentos.filter(p => p.data.startsWith(mesStr))
const receitaDia = avulsasHoje.reduce((a,s) => a + parseMoeda(s.valor), 0)
                 + pagHoje.reduce((a,p) => a + p.valor, 0)
const receitaMes = avulsasMes.reduce((a,s) => a + parseMoeda(s.valor), 0)
                 + pagMes.reduce((a,p) => a + p.valor, 0)
```

## Exclusão de pacote

- Pagamentos **não são** removidos ao excluir o pacote (mantidos no financeiro)
- Apenas remove o pacote de `AppStorage.sessoes` (comportamento atual)

## Exclusão/edição de pagamentos

Não implementado nesta versão.

## Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `js/core/storage.js` | `pagamentos:[]`, salvar/carregar |
| `js/modules/infoCliente.js` | Card de pacote com total/pago/saldo, form registrar pagamento, extrato |
| `js/modules/dashboard.js` | Soma `pagamentos` ao invés de `pacote.valor` |
| `supabase-schema.sql` | Nova tabela `pagamentos` |
| `js/core/supabase.js` | Sync da tabela `pagamentos` |
| `index.html` | Nenhuma mudança necessária |
