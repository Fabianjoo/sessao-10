# 📝 Planejamento e Tarefas (Roadmap)

Este arquivo serve para rastrear bugs, ideias de melhorias e tarefas pendentes para o Gerenciador de Pedidos.

## 🔴 Bugs (Corrigir Agora)
- [ ] **Permitir caracteres especiais no nome do cliente:** Acentos e hífen, por exemplo.
- [ ] **Não permitir salvar com dados incompletos:** Não deve ser possível salvar cliente com telefone "(1" ou com CPF "123." por exemplo.

## 🟡 Melhorias (Próximos Passos)
- [ ] **Marcar campos obrigatórios:** Marcar campos obrigatórios nos formulários com um "*".
- [ ] **Adicionar campo Complemento:** Adicionar campo "Complemento" no cadastro de clientes para informar bloco, apto, etc.
- [ ] **Adicionar botão para fechar:** Permitir fechar as telas de cadastro com um botão "x" no canto superior direito.
- [ ] **ESC para fechar:** Permitir fechar as telas de cadastro com a tecla "ESC".
- [ ] **Permitir editar sessões:** Permitir editar sessões futuras (não fechadas).

## 🔵 Dúvidas (Perguntas)

## 🟢 Ideias & Futuro
- [ ] **Refatoração `padronizacao.js`:** Transformar as funções de máscara em funções puras para facilitar testes unitários.
- [ ] **Feedback Visual:** Trocar o toast de confirmação ao salvar um cliente/sessão para um toast de sucesso.
- [ ] **Exportação de Dados:** Criar um botão para baixar os dados do `localStorage` como um arquivo CSV/JSON (backup).
- [ ] **Gráficos no Dashboard:** Usar uma biblioteca simples (como Chart.js) para mostrar faturamento mensal.
- [ ] **Temas:** Adicionar um modo escuro (Dark Mode).
- [ ] **PWA:** Adicionar um `manifest.json` para permitir a instalação como "App" no celular.

---
*Dica: Use `[x]` para marcar uma tarefa como concluída.*
