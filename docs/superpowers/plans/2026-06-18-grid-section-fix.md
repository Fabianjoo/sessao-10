# Grid Section Visualization Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o layout do grid explícito e robusto usando `grid-template-areas`, eliminando fragilidade do auto-placement misturado com `grid-area` explícito.

**Architecture:** 5 arquivos CSS alterados, zero mudanças em HTML ou JS. Cada section recebe `grid-area` nomeado correspondente ao template definido no container. Ajustes de altura e remoção de propriedades redundantes.

**Tech Stack:** CSS3 (Grid Layout)

**Files Modified:**
- `css/base/style.css`
- `css/modules/formCliente.css`
- `css/modules/listaClientes.css`
- `css/modules/listaSessoes.css`
- `css/modules/dashboard.css`

---

### Task 1: Grid container — adicionar `grid-template-areas` e `gap`

**Files:**
- Modify: `css/base/style.css:124-131`

- [ ] **Step 1: Alterar `.conteiner` para usar áreas nomeadas**

```css
.conteiner{
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

- [ ] **Step 2: Verificar o arquivo**

Run: `head -15 css/base/style.css` e confirme que `.conteiner` tem `grid-template-areas`, `gap` e `padding`.

- [ ] **Step 3: Commit**

```bash
git add css/base/style.css
git commit -m "feat: add named grid-template-areas and gap to container"
```

---

### Task 2: `.form` — adicionar `grid-area: form`

**Files:**
- Modify: `css/modules/formCliente.css:4-14`

- [ ] **Step 1: Adicionar `grid-area: form` no `.form`**

```css
.form {
    background-color: var(--cor-primaria-clara);
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    grid-area: form;
}
```

Remover `min-height: 480px` (linha 7 original).

- [ ] **Step 2: Commit**

```bash
git add css/modules/formCliente.css
git commit -m "fix: add grid-area form and remove min-height from .form"
```

---

### Task 3: `.listaClientes` — adicionar `grid-area: clientes` e ajustar altura

**Files:**
- Modify: `css/modules/listaClientes.css:4-10` e `css/modules/listaClientes.css:35-47`

- [ ] **Step 1: Adicionar `grid-area: clientes` no `.listaClientes`**

```css
.listaClientes{
    background-color: var(--cor-primaria-fundo);
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 10px;
    grid-area: clientes;
}
```

- [ ] **Step 2: Ajustar `height` do `.clientesConteiner`**

Trocar `height: 88%;` por `height: calc(100% - 50px);`:

```css
.clientesConteiner{
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: flex-start;
    background-color: var(--cor-primaria-clara);
    border-radius: 5px;
    width: 100%;
    height: calc(100% - 50px);
    overflow-y: auto;
    margin-top: 10px;
    padding: 10px;
}
```

- [ ] **Step 3: Commit**

```bash
git add css/modules/listaClientes.css
git commit -m "fix: add grid-area clientes and fix height calc"
```

---

### Task 4: `#listaSessoes` — adicionar `grid-area: sessoes` e remover `align-self`

**Files:**
- Modify: `css/modules/listaSessoes.css:18-22`

- [ ] **Step 1: Adicionar `grid-area: sessoes` e remover `align-self: start`**

```css
#listaSessoes {
  background-color: var(--azul-50);
  padding: 20px;
  grid-area: sessoes;
}
```

- [ ] **Step 2: Commit**

```bash
git add css/modules/listaSessoes.css
git commit -m "fix: add grid-area sessoes to section"
```

---

### Task 5: `.dashboard` — trocar `grid-area` antigo por nomeado e remover `align-self`

**Files:**
- Modify: `css/modules/dashboard.css:4-11`

- [ ] **Step 1: Substituir `grid-area` inline por nomeado e remover `align-self`**

```css
.dashboard{
    background-color: #FAEEDA;
    display: flex;
    grid-area: dashboard;
    padding: 10px;
}
```

- [ ] **Step 2: Commit**

```bash
git add css/modules/dashboard.css
git commit -m "fix: replace grid-area with named dashboard area"
```

---

### Task 6: Verificação final

**Files:** todos os 5 CSS

- [ ] **Step 1: Abrir `index.html` no navegador e verificar:**

1. Grid mantém estrutura 2×2 visual
2. Sections têm espaçamento (`gap`) entre si
3. Dashboard ocupa coluna esquerda inferior
4. Sessões ocupam coluna direita inferior
5. Formulário ocupa coluna esquerda superior
6. Lista de clientes ocupa coluna direita superior
7. Nenhum conteúdo vaza ou fica cortado

- [ ] **Step 2: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "chore: final adjustments after visual verification"
```
