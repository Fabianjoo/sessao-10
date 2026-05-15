/* MAIN - Inicialização da aplicação */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carregar dados (já deve ter sido feito pelo storage.js, mas garantimos aqui se necessário)
    if (typeof AppStorage !== 'undefined' && typeof AppStorage.carregarDados === 'function') {
        AppStorage.carregarDados();
    }

    // 2. Inicializar componentes de interface
    if (typeof iniciarRelogio === 'function') {
        iniciarRelogio();
    }

    if (typeof renderizarClientes === 'function') {
        renderizarClientes();
    }

    if (typeof renderDashboard === 'function') {
        renderDashboard();
        // Atualiza dashboard a cada 10 segundos
        setInterval(renderDashboard, 10000);
    }

    // Inicializar calendários ou outras abas se necessário
    if (typeof renderCalendario === 'function') {
        renderCalendario();
    }
});
