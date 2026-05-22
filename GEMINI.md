# Projeto: Sessão 10 — Gestão de Sessões - Clínica Daniandrade

**Sessão 10** é uma plataforma de gestão de sessões para a Clínica Estética Avançada Daniandrade. O nome faz referência às sessões que os clientes da clínica agendam. Este documento fornece orientações e contexto técnico sobre o sistema.

## 📌 Visão Geral do Projeto

O sistema é uma aplicação web voltada para a gestão de clientes, agendamento de sessões e controle financeiro. Foi desenvolvido utilizando a **Vanilla Stack** (HTML, CSS e JS puros).

### Tecnologias Principais
- **HTML5 & CSS3**: Estruturação semântica e estilização modular.
- **JavaScript (ES6+)**: Lógica de negócio e manipulação direta do DOM.
- **LocalStorage**: Persistência de dados local no navegador do usuário.

## 🏗️ Arquitetura e Organização

A aplicação segue uma estrutura modular e organizada por responsabilidades.

### Estrutura de Diretórios
- `/css`:
    - `/base`: Estilos globais e reset.
    - `/components`: Estilos de componentes reutilizáveis (modais, popovers).
    - `/modules`: Estilos específicos de cada funcionalidade ou tela.
- `/js`:
    - `/core`: Lógica central e persistência (`storage.js`).
    - `/utils`: Funções puras e utilitários (`formatters.js`, `masks.js`).
    - `/modules`: Lógica de interface e negócio por funcionalidade.
    - `main.js`: Ponto de entrada e inicialização.

### Estado e Persistência
O estado da aplicação é centralizado no objeto global `AppStorage` (`js/core/storage.js`):
- `AppStorage.clientes`: Lista de clientes.
- `AppStorage.sessoes`: Lista global de sessões.

A persistência é feita via `localStorage` através dos métodos `AppStorage.salvarDados()` e `AppStorage.carregarDados()`.

## 🚀 Desenvolvimento e Execução

### Inicialização
A aplicação é inicializada no arquivo `js/main.js`, que coordena o carregamento dos dados e a renderização inicial dos componentes após o `DOMContentLoaded`.

### Comandos Úteis
Como o projeto é estático, basta abrir o arquivo `index.html` em qualquer navegador moderno.

## 📏 Convenções de Código

1. **Manipulação de Dados**: Nunca manipule o `localStorage` diretamente. Utilize sempre o objeto `AppStorage`.
2. **Utilitários**: Funções de formatação de moeda e máscaras devem ser mantidas em `/js/utils`.
3. **Estilização**: Novos estilos devem seguir a segmentação das pastas em `/css`.
4. **Referência a Dados**: Use `AppStorage.clientes` e `AppStorage.sessoes` em vez de variáveis globais soltas.
