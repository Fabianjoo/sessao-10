/* RELATÓRIO DO PACOTE - abre o cronograma do pacote em uma aba A4 pronta para imprimir/salvar em PDF */

const RELATORIO_ASSINATURA = [
  'Lia Mara Grubert',
  'Massoterapeuta',
  'Técnica em Reabilitação Corporal',
  'Quiropraxista'
];

const RELATORIO_SELOS = {
  concluido: { texto: 'Cronograma encerrado',    icone: 'check'   },
  cancelado: { texto: 'Cronograma cancelado',    icone: 'x'       },
  ativo:     { texto: 'Cronograma em andamento', icone: 'relogio' }
};

const RELATORIO_ICONES = {
  check:   '<path d="M7 12.5l3.2 3.2L17 9" />',
  x:       '<path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />',
  relogio: '<circle cx="12" cy="12" r="5.5" /><path d="M12 9v3.2l2.2 1.6" />',
  seta:    '<path d="M10 8l4 4-4 4" />'
};

function imprimirRelatorioPacote(clienteId, pacoteId) {
  const pacote  = AppStorage.sessoes.find(s => s.id === pacoteId && s.tipo === 'pacote');
  const cliente = AppStorage.clientes.find(c => c.id === clienteId);
  if (!pacote || !cliente) return;

  const janela = window.open('', '_blank');
  if (!janela) {
    alert('⚠️ O navegador bloqueou a nova aba. Permita pop-ups para imprimir o relatório.');
    return;
  }

  janela.document.open();
  janela.document.write(montarHtmlRelatorioPacote(pacote, cliente));
  janela.document.close();
}

function montarHtmlRelatorioPacote(pacote, cliente) {
  const agora = Date.now();
  const total = pacote.totalSessoes || 0;

  const sessoesPacote = AppStorage.sessoes
    .filter(s => s.pacoteId === pacote.id && s.tipo !== 'pacote' && s.status !== 'cancelada')
    .sort((a, b) => ((a.data || '9999') + (a.hora || '')).localeCompare((b.data || '9999') + (b.hora || '')));

  // ---- linhas: sessões marcadas + vagas em aberto até o total contratado ----
  const linhas = sessoesPacote.map((s, i) => ({
    numero: i + 1,
    data: s.data ? formatarDataRelatorio(s.data) : 'sem data',
    estado: getStatus(s, agora) === 'concluida' ? 'concluida' : 'agendada'
  }));
  for (let n = linhas.length + 1; n <= total; n++) {
    linhas.push({ numero: n, data: '—', estado: 'vazia' });
  }

  const metade = Math.ceil(linhas.length / 2);
  const colunas = [linhas.slice(0, metade), linhas.slice(metade)];

  // ---- período ----
  const datadas = sessoesPacote.filter(s => s.data);
  let periodo = '';
  if (datadas.length === 1) {
    periodo = `Início: ${formatarDataRelatorio(datadas[0].data)}`;
  } else if (datadas.length > 1) {
    periodo = `Período: ${formatarDataRelatorio(datadas[0].data)} a ${formatarDataRelatorio(datadas[datadas.length - 1].data)}`;
  }

  const encerrado   = pacote.status === 'concluido';
  const selo        = RELATORIO_SELOS[pacote.status] || RELATORIO_SELOS.ativo;
  const valorTotal  = parseMoeda(pacote.valor);
  const compacto    = metade > 6;

  const linhaHTML = l => `
    <li class="sessao sessao-${l.estado}">
      <span class="num">${l.numero}ª</span>
      <span class="sessao-data">
        <span>${l.data}</span>
        ${l.estado === 'vazia' ? '' : `<svg class="marca" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" />${RELATORIO_ICONES[l.estado === 'concluida' ? 'check' : 'seta']}</svg>`}
      </span>
    </li>`;

  const assinatura = RELATORIO_ASSINATURA
    .map((item, i) => `<span class="${i === 0 ? 'assinatura-nome' : ''}">${escaparHtmlRelatorio(item)}</span>`)
    .join('<span class="sep">|</span>');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Relatório - ${escaparHtmlRelatorio(cliente.nome)} - ${escaparHtmlRelatorio(pacote.servico)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 0; }

  :root {
    --creme: #F4EDE3;
    --creme-claro: #FBF7F1;
    --marrom: #3E2518;
    --marrom-medio: #6B4430;
    --dourado: #B98A5E;
    --linha: #CDB49A;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html {
    background: var(--creme);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: 'Sora', system-ui, sans-serif;
    color: var(--marrom);
  }

  .folha {
    position: relative;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 18mm 20mm 12mm;
    background: var(--creme);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 7mm;
  }

  .decoracao {
    position: absolute;
    inset: 0;
    height: 297mm;
    overflow: hidden;
    pointer-events: none;
  }

  .decoracao::before {
    content: '';
    position: absolute;
    left: -70mm;
    bottom: -80mm;
    width: 150mm;
    height: 150mm;
    border-radius: 50%;
    background: radial-gradient(circle at 70% 25%, rgba(185,138,94,.28), rgba(185,138,94,.06) 70%);
    box-shadow: 0 0 0 6mm rgba(185,138,94,.08);
  }

  .decoracao::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 62mm;
    width: 22mm;
    height: 38mm;
    background: repeating-linear-gradient(135deg, rgba(185,138,94,.22) 0 1.2mm, transparent 1.2mm 4mm);
  }

  .folha > :not(.decoracao) { position: relative; }

  /* ---- cabeçalho ---- */
  .cabecalho {
    display: flex;
    align-items: center;
    gap: 7mm;
    width: 100%;
    padding: 0 4mm 6mm;
    border-bottom: 1px solid var(--marrom);
  }

  .logo { width: 20mm; height: 28mm; flex-shrink: 0; }
  .logo path { fill: none; stroke: var(--dourado); stroke-width: 2.4; stroke-linecap: round; }
  .logo circle { fill: var(--dourado); }

  .divisor-v { width: 1px; align-self: stretch; background: var(--marrom); }

  h1 { display: flex; flex-direction: column; line-height: 1.15; }
  .t1 { font-size: 23pt; font-weight: 700; text-transform: uppercase; }
  .t2 { font-size: 23pt; font-weight: 300; letter-spacing: .14em; text-transform: uppercase; }

  /* ---- cliente e pacote ---- */
  .cliente {
    display: flex;
    width: 88%;
    border: 1px solid var(--marrom-medio);
    border-radius: 2.5mm;
    overflow: hidden;
    background: var(--creme-claro);
  }

  .cliente-rotulo {
    display: flex;
    align-items: center;
    padding: 0 6mm;
    background: var(--marrom);
    color: #fff;
    font-size: 13pt;
    font-weight: 600;
  }

  .cliente-nome { padding: 3mm 7mm; font-size: 21pt; font-weight: 600; }

  .pacote-info { text-align: center; }
  .servico { font-size: 16pt; }
  .servico strong { font-weight: 700; }
  .periodo { margin-top: 1.5mm; font-size: 11pt; color: var(--marrom-medio); }

  /* ---- sessões ---- */
  .sessoes {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    gap: 0 9mm;
    width: 88%;
  }

  .divisor-col { background: var(--linha); }

  .coluna { list-style: none; display: flex; flex-direction: column; gap: 2.5mm; }

  .sessao { display: flex; align-items: center; gap: 4mm; }

  .num {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 11mm;
    height: 11mm;
    border-radius: 50%;
    background: var(--marrom);
    color: #fff;
    font-size: 12pt;
    font-weight: 700;
  }

  .sessao-data {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5mm 0;
    border-bottom: 1px solid var(--linha);
    font-size: 15pt;
  }

  .marca { width: 6mm; height: 6mm; }
  .marca circle { fill: none; stroke: var(--dourado); stroke-width: 1.4; }
  .marca path { fill: none; stroke: var(--dourado); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

  .sessao-agendada .num { background: transparent; color: var(--marrom); border: 1.5px solid var(--marrom); }
  .sessao-vazia .num { background: transparent; color: var(--linha); border: 1px dashed var(--linha); }
  .sessao-vazia .sessao-data { color: var(--linha); }

  .compacto .coluna { gap: 1.2mm; }
  .compacto .num { width: 8mm; height: 8mm; font-size: 9.5pt; }
  .compacto .sessao-data { font-size: 12pt; padding: .8mm 0; }
  .compacto .marca { width: 5mm; height: 5mm; }

  /* ---- selo ---- */
  .selo-faixa { display: flex; align-items: center; width: 100%; gap: 5mm; }
  .selo-linha { flex: 1; height: 1px; background: var(--marrom-medio); }

  .selo {
    display: flex;
    align-items: center;
    gap: 5mm;
    padding: 3mm 10mm 3mm 5mm;
    border-radius: 999px;
    background: var(--marrom);
    color: #fff;
  }

  .selo svg { width: 10mm; height: 10mm; }
  .selo svg > circle:first-child { fill: #fff; stroke: none; }
  .selo svg path, .selo svg circle + circle { fill: none; stroke: var(--marrom); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .selo-div { width: 1px; height: 9mm; background: rgba(255,255,255,.6); }
  .selo-texto { font-size: 15pt; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; }

  /* ---- valor ---- */
  .valor {
    display: flex;
    align-items: center;
    gap: 6mm;
    padding: 4mm 12mm 4mm 7mm;
    border: 1px solid var(--linha);
    border-radius: 6mm;
    background: rgba(251,247,241,.7);
  }

  .valor-icone {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 15mm;
    height: 15mm;
    border: 2px solid var(--dourado);
    border-radius: 50%;
    color: var(--dourado);
    font-size: 14pt;
    font-weight: 700;
  }

  .valor-div { width: 1px; height: 15mm; background: var(--linha); }
  .valor-rotulo { font-size: 13pt; }
  .valor-numero { font-size: 28pt; font-weight: 700; line-height: 1.1; }

  /* ---- rodapé ---- */
  .rodape {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4mm;
    font-size: 9pt;
  }

  .rodape p { display: flex; flex-wrap: wrap; justify-content: center; gap: 0 3mm; }
  .assinatura-nome { font-weight: 600; }
  .sep { color: var(--marrom-medio); }
  .rodape-linha { width: 50mm; height: 1px; background: var(--marrom-medio); }

  /* ---- tela ---- */
  .barra { display: none; }

  @media screen {
    html { background: #D9D1C6; }
    body { padding: 10mm 0; }
    .folha { box-shadow: 0 2mm 8mm rgba(0,0,0,.15); }
    .barra {
      display: block;
      position: fixed;
      top: 5mm;
      right: 5mm;
      z-index: 1;
    }
    .barra button {
      padding: 3mm 6mm;
      border: none;
      border-radius: 2mm;
      background: var(--marrom);
      color: #fff;
      font: 600 11pt 'Sora', system-ui, sans-serif;
      cursor: pointer;
    }
  }
</style>
</head>
<body>
  <div class="barra"><button type="button" onclick="window.print()">🖨️ Imprimir</button></div>

  <main class="folha">
    <div class="decoracao"></div>

    <header class="cabecalho">
      <svg class="logo" viewBox="0 0 60 90" aria-hidden="true">
        <path d="M24 4c0 7-3 10-10 12C7 18 5 24 6 32c1 8 7 13 6 24-1 11-5 19-3 30" />
        <path d="M36 4c0 7 3 10 10 12 7 2 9 8 8 16-1 8-7 13-6 24 1 11 5 19 3 30" />
        <path d="M14 16c-6 6-9 14-10 24" />
        <path d="M46 16c6 6 9 14 10 24" />
        ${[14, 21, 28, 35, 42, 49, 56, 63, 70, 77].map((y, i) => `<circle cx="30" cy="${y}" r="${(2.6 - i * 0.12).toFixed(2)}" />`).join('')}
      </svg>
      <div class="divisor-v"></div>
      <h1>
        <span class="t1">${encerrado ? 'Relatório de fechamento' : 'Relatório'}</span>
        <span class="t2">de cronograma</span>
      </h1>
    </header>

    <div class="cliente">
      <span class="cliente-rotulo">Cliente:</span>
      <span class="cliente-nome">${escaparHtmlRelatorio(cliente.nome)}</span>
    </div>

    <div class="pacote-info">
      <p class="servico">${escaparHtmlRelatorio(pacote.servico)} — <strong>${total} ${total === 1 ? 'sessão' : 'sessões'}</strong></p>
      ${periodo ? `<p class="periodo">${periodo}</p>` : ''}
    </div>

    ${linhas.length > 0 ? `
    <div class="sessoes ${compacto ? 'compacto' : ''}">
      <ol class="coluna">${colunas[0].map(linhaHTML).join('')}</ol>
      <div class="divisor-col"></div>
      <ol class="coluna">${colunas[1].map(linhaHTML).join('')}</ol>
    </div>` : ''}

    <div class="selo-faixa">
      <span class="selo-linha"></span>
      <div class="selo">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" />${RELATORIO_ICONES[selo.icone]}</svg>
        <span class="selo-div"></span>
        <span class="selo-texto">${selo.texto}</span>
      </div>
      <span class="selo-linha"></span>
    </div>

    ${valorTotal > 0 ? `
    <div class="valor">
      <span class="valor-icone">R$</span>
      <span class="valor-div"></span>
      <div>
        <div class="valor-rotulo">Valor total:</div>
        <div class="valor-numero">${formatMoeda(valorTotal)}</div>
      </div>
    </div>` : ''}

    <footer class="rodape">
      <p>${assinatura}</p>
      <span class="rodape-linha"></span>
    </footer>
  </main>

  <script>
    window.addEventListener('load', () => document.fonts.ready.then(() => window.print()));
  </script>
</body>
</html>`;
}

function formatarDataRelatorio(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function escaparHtmlRelatorio(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

window.imprimirRelatorioPacote = imprimirRelatorioPacote;
