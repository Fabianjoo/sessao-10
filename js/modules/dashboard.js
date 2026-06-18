function renderDashboard() {
  const agora   = new Date();
  const agoraMs = agora.getTime();
  const hojeStr = agora.toISOString().slice(0, 10);
  const mesStr  = hojeStr.slice(0, 7);

  const avulsas  = AppStorage.sessoes.filter(s => s.tipo !== 'pacote' && s.data && s.hora);
  const hoje     = avulsas.filter(s => s.data === hojeStr);
  const concHoje = hoje.filter(s => getStatus(s, agoraMs) === 'concluida');
  const restHoje = hoje.length - concHoje.length;
  const doMes    = avulsas.filter(s => s.data.startsWith(mesStr));
  const concMes  = doMes.filter(s => getStatus(s, agoraMs) === 'concluida');

  const pagamentosHoje = AppStorage.pagamentos.filter(p => p.data === hojeStr);
  const pagamentosMes = AppStorage.pagamentos.filter(p => p.data?.startsWith(mesStr));

  const receitaDia = hoje.reduce((a, s) => a + parseMoeda(s.valor), 0)
                   + pagamentosHoje.reduce((a, p) => a + (+p.valor || 0), 0);
  const receitaMes = doMes.reduce((a, s) => a + parseMoeda(s.valor), 0)
                   + pagamentosMes.reduce((a, p) => a + (+p.valor || 0), 0);

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

  if (document.getElementById('dash-root')) {
    document.getElementById('dash-root').innerHTML = html;
  }
}

window.renderDashboard = renderDashboard;

