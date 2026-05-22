/* MAIN - Inicialização da aplicação */

function initApp() {
    if (typeof AppStorage !== 'undefined' && typeof AppStorage.carregarDados === 'function') {
        AppStorage.carregarDados();
        AppStorage.carregarDadosRemoto();
    }

    if (typeof iniciarRelogio === 'function') {
        iniciarRelogio();
    }

    if (typeof renderizarClientes === 'function') {
        renderizarClientes();
    }

    if (typeof renderDashboard === 'function') {
        renderDashboard();
        setInterval(renderDashboard, 10000);
    }

    if (typeof renderCalendario === 'function') {
        renderCalendario();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof AppAuth !== 'undefined' && typeof AppAuth.init === 'function') {
        AppAuth.init();
    } else {
        initApp();
    }
});
