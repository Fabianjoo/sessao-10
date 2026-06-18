# 📝 Planejamento e Tarefas (Roadmap)

Este arquivo serve para rastrear bugs, ideias de melhorias e tarefas pendentes para o **Sessão 10**.


## ⚪ Reestruturação (Concluído)
- [x] **Organização de Diretórios:** Divisão em css/ e js/ com subpastas por responsabilidade.
- [x] **Centralização de Estado:** Criação do módulo `AppStorage` para gerenciar dados e persistência.
- [x] **Modularização de Utilitários:** Extração de máscaras e formatadores para arquivos dedicados.
- [x] **Limpeza do HTML:** Atualização de links e remoção de scripts redundantes.

- [x] **Permitir caracteres especiais no nome do cliente:** Acentos e hífen, por exemplo.
- [x] **Não permitir salvar com dados incompletos:** Não deve ser possível salvar cliente com telefone "(1" ou com CPF "123." por exemplo.
- [x] **Deletar cliente não deve deletar histórico**: Deletar apenas as seções futuras do cliente.
- [x] **Ao deletar atualizar a aba esquerda de próxima sessão**
- [x] **Buscar cliente por nome, telefone, CEP e CPF simultaneamente**
- [x] **Aceitar caracteres especiais no nome** ("/" e números)
- [x] **Auto-preenchimento de endereço via CEP (ViaCEP)**
- [x] **Pagamentos de pacote** — registrar pagamentos parciais com extrato e saldo
- [x] **Editar pacote** — alterar qtd de sessões, valor e observações
- [x] **Fluxo "Esqueci minha senha"** — redefinição de senha via email (Supabase Auth)
- [x] **Visual verde ao finalizar sessão** — classe `sessao-concluida` nas listas de hoje e histórico
- [x] **Campo observação no cadastro/edição/info do cliente**
- [x] **Calendário exibe todas as sessões (inclusive concluídas/canceladas) com distinção visual**
- [x] **Botão "Confirmar sessão" nos itens do calendário**
- [x] **Grid layout refatorado para `grid-template-areas` explícito**

## 🔴 Prioridade Máxima — Após finalizar configuração do Supabase
- [x] **Adicionar autenticação com Supabase Auth (email/senha)**
- [x] **Restringir RLS policies** — substituir `USING (true)` por `USING (auth.role() = 'authenticated')` nas tabelas `clientes` e `sessoes`
- [x] **Criar tela de login** protegendo o acesso ao app
- [x] **Testar segurança**: verificar se anon key pública não permite acesso sem login

## 🟡 Melhorias (Próximos Passos)
- [ ] **Permitir cadastrar prioridade do cliente**
- [ ] **Ao cadastrar uma sessão do pacote, puxar automaticamente a descrição**
- [ ] **Mostrar descrição em todos os quadrados de sessão**
- [ ] **Marcar campos obrigatórios:** Marcar campos obrigatórios nos formulários com um "*".
- [ ] **Adicionar campo Complemento:** Adicionar campo "Complemento" no cadastro de clientes para informar bloco, apto, etc.
- [ ] **Adicionar botão para fechar:** Permitir fechar as telas de cadastro com um botão "x" no canto superior direito.
- [ ] **ESC para fechar:** Permitir fechar as telas de cadastro com a tecla "ESC".
- [ ] **Permitir editar sessões:** Permitir editar sessões futuras (não fechadas).
- [ ] **Migrar para o CloudFare:** Migrar armazenamento e autenticação. 

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

