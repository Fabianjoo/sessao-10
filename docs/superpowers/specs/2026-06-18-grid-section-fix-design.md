# Grid Section Visualization — Fix Design

## Problema

Layout do grid em `css/base/style.css` usa abordagem mista: `.dashboard` posicionado com `grid-area` explícito (`2 / 1 / 3 / 2`), enquanto as demais sections (`.form`, `.listaClientes`, `#listaSessoes`) dependem de auto-placement. Isso cria fragilidade — qualquer mudança na ordem do HTML quebra o layout. Além disso:

- Sem `gap` entre as sections
- `align-self: start` em itens de row `1fr` deixa espaço vazio
- Alturas percentuais (`height: 88%`) sem referência confiável
- `min-height: 480px` no `.form` pode vazar na coluna estreita

## Decisão

Manter a estrutura visual 2×2 existente, mas tornar o layout explícito e robusto usando `grid-template-areas` nomeado.

## Alterações

### 1. Grid container (`css/base/style.css`)

```css
.conteiner {
    display: grid;
    grid-template-columns: 1fr 4fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
        "form       clientes"
        "dashboard  sessoes";
    gap: 8px;
    height: calc(100vh - 55px);
    padding: 8px;
}
```

### 2. Sections com `grid-area`

| Section | Arquivo | `grid-area` |
|---------|---------|-------------|
| `.form` | `css/modules/formCliente.css` | `form` |
| `.listaClientes` | `css/modules/listaClientes.css` | `clientes` |
| `#listaSessoes` | `css/modules/listaSessoes.css` | `sessoes` |
| `.dashboard` | `css/modules/dashboard.css` | `dashboard` |

### 3. Remover `align-self: start`

- `#listaSessoes` em `listaSessoes.css`: remover `align-self: start` (linha 21)
- `.dashboard` em `dashboard.css`: remover `align-self: start` (linha 8)

### 4. Ajustar alturas

- `.listaClientes`: manter `height: 100%`
- `.clientesConteiner`: trocar `height: 88%` por `height: calc(100% - 50px)` (50px = altura do input + margens)
- `.form`: remover `min-height: 480px`

### 5. Remover `grid-area` antigo

- `.dashboard` em `dashboard.css`: trocar `grid-area: 2 / 1 / 3 / 2;` por `grid-area: dashboard;`

## Não-escopo

- Nenhuma mudança visual no layout 2×2
- Nenhuma mudança no conteúdo ou comportamento das sections
- Nenhuma mudança em JavaScript ou HTML
