/* APP STORAGE - Centralização de Estado e Persistência */
const AppStorage = {
    clientes: [],
    sessoes: [],
    pagamentos: [],

    salvarDados() {
        this.salvarDadosLocal();
        if (typeof supabaseSalvar === 'function') {
            supabaseSalvar();
        }
    },

    salvarDadosLocal() {
        localStorage.setItem('clientes', JSON.stringify(this.clientes));
        localStorage.setItem('sessoes', JSON.stringify(this.sessoes));
        localStorage.setItem('pagamentos', JSON.stringify(this.pagamentos));
    },

    getSessoesDoCliente(clienteId) {
        return this.sessoes.filter(s => s.clienteId === clienteId);
    },

    carregarDados() {
        const c = localStorage.getItem('clientes');
        const s = localStorage.getItem('sessoes');
        const p = localStorage.getItem('pagamentos');
        try { if (c) this.clientes = JSON.parse(c); } catch (e) { this.clientes = []; }
        try { if (s) this.sessoes = JSON.parse(s); } catch (e) { this.sessoes = []; }
        try { if (p) this.pagamentos = JSON.parse(p); } catch (e) { this.pagamentos = []; }
        this.clientes.forEach(c => { if ('observacao' in c && !('observacoes' in c)) { c.observacoes = c.observacao; delete c.observacao; } });
    },

    carregarDadosRemoto() {
        if (typeof supabaseSync === 'function') {
            supabaseSync();
        }
    }
};

// Inicialização imediata do carregamento
AppStorage.carregarDados();
