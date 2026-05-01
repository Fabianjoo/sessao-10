// ── Troca de abas ──
function trocarAba(id) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('ativo'));
    document.querySelectorAll('.painel').forEach(p => p.classList.remove('ativo'));
  
    document.getElementById('tab-' + id).classList.add('ativo');
    document.getElementById('painel-' + id).classList.add('ativo');
  
    if (id === 'calendario') renderCalendario();
    if (id === 'historico')  renderHistorico();
  }
  
  // ── Relógio ──
  function iniciarRelogio() {
    function tick() {
      const now = new Date();
  
      const relogio = document.getElementById('relogio');
      const dataEl  = document.getElementById('dataHoje');
  
      if (relogio) relogio.textContent = now.toLocaleTimeString('pt-BR');
      if (dataEl)  dataEl.textContent  = now.toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
  
      atualizarSessoesHoje();
    }
  
    tick();
    setInterval(tick, 1000);
  }
  
  iniciarRelogio();
  
  // ── Status da sessão ──
  // duracao é opcional — se não existir assume 50 min como padrão
  function getStatus(sessao, agoraMs) {
    if (!sessao.data || !sessao.hora) return 'pendente';
  
    const inicio  = new Date(sessao.data + 'T' + sessao.hora + ':00').getTime();
    const duracao = sessao.duracao ? Number(sessao.duracao) : 50;
    const fim     = inicio + duracao * 60 * 1000;
  
    if (agoraMs < inicio)  return 'pendente';
    if (agoraMs <= fim)    return 'andamento';
    return 'concluida';
  }
  
  // ── Sessões de Hoje ──
  function atualizarSessoesHoje() {
    const agora   = new Date();
    const hojeStr = agora.toISOString().slice(0, 10);
    const hojeMs  = agora.getTime();
  
    // só sessões avulsas (pacotes não têm data/hora própria)
    const sessoesHoje = sessoes.filter(s =>
      s.tipo !== 'pacote' && s.data === hojeStr
    );
  
    const lista = document.getElementById('lista-hoje');
    const dot   = document.getElementById('dot-hoje');
    if (!lista) return;
  
    const temAndamento = sessoesHoje.some(s => getStatus(s, hojeMs) === 'andamento');
    if (dot) dot.classList.toggle('visivel', temAndamento);
  
    if (sessoesHoje.length === 0) {
      lista.innerHTML = '<p class="vazio">Nenhuma sessão marcada para hoje.</p>';
      return;
    }
  
    sessoesHoje.sort((a, b) => a.hora.localeCompare(b.hora));
  
    const labelMap  = { pendente: 'Pendente', andamento: 'Em andamento', concluida: 'Concluída' };
    const classeMap = { pendente: 's-pendente', andamento: 's-andamento', concluida: 's-concluida' };
  
    lista.innerHTML = sessoesHoje.map(s => {
      const status = getStatus(s, hojeMs);
      return `
        <div class="sessao-card-lista">
          <div class="sessao-hora">${s.hora}</div>
          <div class="sessao-info">
            <div class="sessao-nome">${s.nomeCliente}</div>
            <div class="sessao-detalhe">${s.servico}${s.duracao ? ' · ' + s.duracao + ' min' : ''}</div>
          </div>
          <span class="sessao-status ${classeMap[status]}">${labelMap[status]}</span>
        </div>
      `;
    }).join('');
  }
  
  // ── Calendário ──
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  let calMes = new Date().getMonth();
  let calAno = new Date().getFullYear();
  
  function mudarMes(delta) {
    calMes += delta;
    if (calMes < 0)  { calMes = 11; calAno--; }
    if (calMes > 11) { calMes = 0;  calAno++; }
    renderCalendario();
  }
  
  function renderCalendario() {
    const elMes = document.getElementById('calMes');
    const lista = document.getElementById('calLista');
    if (!elMes || !lista) return;
  
    elMes.textContent = meses[calMes] + ' ' + calAno;
  
    const mesStr = calAno + '-' + String(calMes + 1).padStart(2, '0');
  
    // só sessões avulsas com data definida
    const doMes = sessoes.filter(s =>
      s.tipo !== 'pacote' && s.data && s.data.startsWith(mesStr)
    );
  
    if (doMes.length === 0) {
      lista.innerHTML = '<p class="vazio">Nenhuma sessão neste mês.</p>';
      return;
    }
  
    // Agrupa por dia
    const porDia = {};
    doMes.forEach(s => {
      if (!porDia[s.data]) porDia[s.data] = [];
      porDia[s.data].push(s);
    });
  
    lista.innerHTML = Object.keys(porDia).sort().reverse().map(data => {
      const [ano, mes, dia] = data.split('-');
      const itens = porDia[data]
        .sort((a, b) => a.hora.localeCompare(b.hora))
        .map(s => `
          <div class="cal-item">
            <span class="cal-dot"></span>
            ${s.hora} — ${s.nomeCliente} · ${s.servico}
          </div>
        `).join('');
      return `
        <div class="cal-grupo">
          <div class="cal-dia-label">${dia}/${mes}/${ano}</div>
          ${itens}
        </div>
      `;
    }).join('');
  }
  
  // ── Histórico ──
  function renderHistorico() {
    const agora = new Date().getTime();
    const lista = document.getElementById('lista-historico');
    if (!lista) return;
  
    // só avulsas já concluídas
    const finalizadas = sessoes.filter(s =>
      s.tipo !== 'pacote' && s.data && s.hora && getStatus(s, agora) === 'concluida'
    );
  
    if (finalizadas.length === 0) {
      lista.innerHTML = '<p class="vazio">Nenhuma sessão finalizada ainda.</p>';
      return;
    }
  
    finalizadas.sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));
  
    lista.innerHTML = finalizadas.map(s => {
      const [ano, mes, dia] = s.data.split('-');
      const badgeClass = s.pago ? 'badge-pago' : 'badge-pendente-pag';
      const badgeLabel = s.pago ? 'Pago'       : 'Pendente';
      return `
        <div class="hist-item">
          <div>
            <div class="hist-data">${dia}/${mes}/${ano}</div>
            <div class="hist-nome">${s.nomeCliente}</div>
            <div class="hist-detalhe">${s.servico} · ${s.hora}</div>
          </div>
          <span class="${badgeClass}">${badgeLabel}</span>
        </div>
      `;
    }).join('');
  }
  
  // ── Init ──
  iniciarRelogio();
  renderCalendario();