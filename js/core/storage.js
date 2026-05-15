/* APP STORAGE - Centralização de Estado e Persistência */
const AppStorage = {
    clientes: [],
    sessoes: [],

    salvarDados() {
        localStorage.setItem('clientes', JSON.stringify(this.clientes));
        localStorage.setItem('sessoes', JSON.stringify(this.sessoes));
    },

    carregarDados() {
        const c = localStorage.getItem('clientes');
        const s = localStorage.getItem('sessoes');
        if (c) this.clientes = JSON.parse(c);
        if (s) this.sessoes = JSON.parse(s);

        // Reparo de dados corrompidos por refatoração anterior
        this.clientes.forEach(cliente => {
            if (cliente['AppStorage.sessoes']) {
                if (!cliente.sessoes || cliente.sessoes.length === 0) {
                    cliente.sessoes = cliente['AppStorage.sessoes'];
                }
                delete cliente['AppStorage.sessoes'];
            }
            if (!cliente.sessoes) {
                cliente.sessoes = [];
            }
        });
    }
};

// Inicialização imediata do carregamento
AppStorage.carregarDados();
