/* MASKS - Aplicação de máscaras em inputs */

const Masks = {
    telefone: (v) => {
        v = v.replace(/\D/g, '').slice(0, 11);
        let r = '';
        if (v.length > 0) r += '(' + v.slice(0, 2);
        if (v.length >= 2) r += ') ' + v.slice(2, 7);
        if (v.length >= 7) r += '-' + v.slice(7, 11);
        return r;
    },
    cpf: (v) => {
        v = v.replace(/\D/g, '').slice(0, 11);
        let r = '';
        if (v.length > 0) r += v.slice(0, 3);
        if (v.length >= 3) r += '.' + v.slice(3, 6);
        if (v.length >= 6) r += '.' + v.slice(6, 9);
        if (v.length >= 9) r += '-' + v.slice(9, 11);
        return r;
    },
    cep: (v) => {
        v = v.replace(/\D/g, '').slice(0, 8);
        let r = '';
        if (v.length > 0) r += v.slice(0, 5);
        if (v.length >= 5) r += '-' + v.slice(5, 8);
        return r;
    },
    apenasNumeros: (v) => v.replace(/\D/g, ''),
    apenasLetrasENomes: (v) => v.replace(/[^a-zA-ZÀ-ÿ\s\-\']/g, '')
};

// Listeners para os campos de cadastro de cliente
document.addEventListener('DOMContentLoaded', () => {
    const elTelefone = document.getElementById('telefone');
    const elCpf = document.getElementById('cpf');
    const elCep = document.getElementById('cep');
    const elNumero = document.getElementById('numero');
    const elNome = document.getElementById('nomeCliente');

    if (elTelefone) {
        elTelefone.addEventListener('input', (e) => {
            if (e.inputType === 'deleteContentBackward') return;
            e.target.value = Masks.telefone(e.target.value);
        });
    }

    if (elCpf) {
        elCpf.addEventListener('input', (e) => {
            if (e.inputType === 'deleteContentBackward') return;
            e.target.value = Masks.cpf(e.target.value);
        });
    }

    if (elCep) {
        elCep.addEventListener('input', (e) => {
            if (e.inputType === 'deleteContentBackward') return;
            e.target.value = Masks.cep(e.target.value);
        });
    }

    if (elNumero) {
        elNumero.addEventListener('input', (e) => {
            e.target.value = Masks.apenasNumeros(e.target.value);
        });
    }

    if (elNome) {
        elNome.addEventListener('input', (e) => {
            e.target.value = Masks.apenasLetrasENomes(e.target.value);
        });
    }
});

// Função global para ser usada em oninput (caso necessário em outros campos)
function mascaraValor(el) {
    let v = el.value.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    el.value = "R$ " + v;
}
