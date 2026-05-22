/* APP STORAGE - Centralização de Estado e Persistência */
const AppStorage = {
    clientes: [],
    sessoes: [],

    salvarDados() {
        this.salvarDadosLocal();
        if (typeof supabaseSalvar === 'function') {
            supabaseSalvar();
        }
    },

    salvarDadosLocal() {
        localStorage.setItem('clientes', JSON.stringify(this.clientes));
        localStorage.setItem('sessoes', JSON.stringify(this.sessoes));
    },

    getSessoesDoCliente(clienteId) {
        return this.sessoes.filter(s => s.clienteId === clienteId);
    },

    carregarDados() {
        const c = localStorage.getItem('clientes');
        const s = localStorage.getItem('sessoes');
        try { if (c) this.clientes = JSON.parse(c); } catch (e) { this.clientes = []; }
        try { if (s) this.sessoes = JSON.parse(s); } catch (e) { this.sessoes = []; }

        // Reparo de dados corrompidos por refatoração anterior
        this.clientes.forEach(cliente => {
            if (cliente['AppStorage.sessoes']) {
                delete cliente['AppStorage.sessoes'];
            }
            delete cliente.sessoes;
        });
    },

    carregarDadosRemoto() {
        if (typeof supabaseSync === 'function') {
            supabaseSync();
        }
    }
};

// Inicialização imediata do carregamento
AppStorage.carregarDados();
