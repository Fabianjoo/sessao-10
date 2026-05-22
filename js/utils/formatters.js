/* FORMATTERS - Funções puras para formatação de dados */

const _moedaFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function parseMoeda(str) {
    if (!str) return 0;
    return parseFloat(str.replace('R$','').replace(/\./g,'').replace(',','.').trim()) || 0;
}

function formatMoeda(v) {
    return _moedaFormatter.format(v);
}

window.parseMoeda = parseMoeda;
window.formatMoeda = formatMoeda;
