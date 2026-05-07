function parseMoeda(str) {
  if (!str) return 0;
  return parseFloat(str.replace('R$','').replace(/\./g,'').replace(',','.').trim()) || 0;
}

function formatMoeda(v) {
  return 'R$ ' + v.toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}

function renderDashboard() {
  const agora   = new Date();
  const agoraMs = agora.getTime();
  const hojeStr = agora.toISOString().slice(0, 10);
  const mesStr  = hojeStr.slice(0, 7);

  const avulsas  = sessoes.filter(s => s.tipo !== 'pacote' && s.data && s.hora);
  const hoje     = avulsas.filter(s => s.data === hojeStr);
  const concHoje = hoje.filter(s => getStatus(s, agoraMs) === 'concluida');
  const restHoje = hoje.length - concHoje.length;
  const doMes    = avulsas.filter(s => s.data.startsWith(mesStr));
  const concMes  = doMes.filter(s => getStatus(s, agoraMs) === 'concluida');

  // Pacotes cadastrados hoje e no mês (valor total na data de cadastro)
  const pacotesDoDia = sessoes.filter(s => s.tipo === 'pacote' && s.dataCadastro === hojeStr);
  const pacotesDoMes = sessoes.filter(s => s.tipo === 'pacote' && s.dataCadastro?.startsWith(mesStr));

  // Receita = sessões avulsas + valor total dos pacotes cadastrados no período
  const receitaDia = hoje.reduce((a, s) => a + parseMoeda(s.valor), 0)
                   + pacotesDoDia.reduce((a, s) => a + parseMoeda(s.valor), 0);
  const receitaMes = doMes.reduce((a, s) => a + parseMoeda(s.valor), 0)
                   + pacotesDoMes.reduce((a, s) => a + parseMoeda(s.valor), 0);

  const proxima = avulsas
    .filter(s => getStatus(s, agoraMs) === 'pendente')
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))[0];

  let html = '';

  html += `
    <div class="d-card">
      <div>
        <div class="d-label">Hoje</div>
        <div class="d-valor">${hoje.length}</div>
        <div class="d-sub">${concHoje.length} concluída${concHoje.length !== 1 ? 's' : ''} · ${restHoje} pendente${restHoje !== 1 ? 's' : ''}</div>
      </div>
      <div class="d-icon">📅</div>
    </div>
    <div class="d-card">
      <div>
        <div class="d-label">Clientes</div>
        <div class="d-valor">${clientes.length}</div>
        <div class="d-sub">cadastrados</div>
      </div>
      <div class="d-icon">👥</div>
    </div>
    <div class="d-card">
      <div>
        <div class="d-label">Mês</div>
        <div class="d-valor">${concMes.length}<span style="font-size:13px;color:#9b7a4a"> / ${doMes.length}</span></div>
        <div class="d-sub">sessões realizadas</div>
      </div>
      <div class="d-icon">✅</div>
    </div>
    <div class="d-financeiro">
      <div class="d-fin-titulo">💰 Financeiro</div>
      <div class="d-fin-row">
        <div>
          <div class="d-fin-label">Hoje</div>
          <div class="d-fin-valor">${formatMoeda(receitaDia)}</div>
        </div>
        <div>
          <div class="d-fin-label">Este mês</div>
          <div class="d-fin-valor">${formatMoeda(receitaMes)}</div>
        </div>
        <div>
          <div class="d-fin-label">Sessões</div>
          <div class="d-fin-valor">${doMes.length}</div>
        </div>
      </div>
    </div>
  `;

  html += `<div class="d-secao">Próxima sessão</div>`;
  if (proxima) {
    const [ano, mes, dia] = proxima.data.split('-');
    const isHoje = proxima.data === hojeStr;
    html += `
      <div class="d-proxima">
        <div class="d-prox-hora">${proxima.hora}</div>
        <div class="d-prox-div"></div>
        <div>
          <div class="d-prox-nome">${proxima.nomeCliente}</div>
          <div class="d-prox-serv">${isHoje ? 'Hoje' : dia+'/'+mes+'/'+ano} · ${proxima.servico}</div>
        </div>
      </div>
    `;
  } else {
    html += `<div class="d-vazio">Nenhuma agendada</div>`;
  }

  document.getElementById('dash-root').innerHTML = html;
}

renderDashboard();
setInterval(renderDashboard, 10000);