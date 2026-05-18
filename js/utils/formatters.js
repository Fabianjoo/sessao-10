/* FORMATTERS - Funções puras para formatação de dados */

function parseMoeda(str) {
    if (!str) return 0;
    return parseFloat(str.replace('R$','').replace(/\./g,'').replace(',','.').trim()) || 0;
}

function formatMoeda(v) {
    return 'R$ ' + v.toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}

window.parseMoeda = parseMoeda;
window.formatMoeda = formatMoeda;
