function abrirPopover(cliente) {
  const popover = document.querySelector('.popoverCliente');
  const info = document.querySelector('.infoCliente');

  let enderecoCompleto = '';
  if (cliente.endereco) enderecoCompleto += cliente.endereco;
  if (cliente.numero)   enderecoCompleto += `, ${cliente.numero}`;
  if (cliente.cep)      enderecoCompleto += ` - CEP: ${cliente.cep}`;

  const sessoesDoCliente = AppStorage.getSessoesDoCliente(cliente.id);
  const sessoesAvulsas = sessoesDoCliente.filter(s => s.tipo === 'avulsa' || !s.tipo);
  const pacotes        = sessoesDoCliente.filter(s => s.tipo === 'pacote');

  // ---- HTML: aba sessões ----
  const sessoesHTML = sessoesAvulsas.length > 0
  ? sessoesAvulsas.map(s => `
      <div class="sessao-card">
        <div class="sessao-card-top">
          <strong>${s.servico}</strong>
          <span class="badge badge-${s.status}">${s.status}</span>
          <button class="btn-excluir-sessao" aria-label="Excluir sessão" onclick="excluirSessao(${cliente.id}, ${s.id})">🗑️</button>
        </div>
        <p>📅 ${s.data} às ${s.hora}</p>
        ${s.valor ? `<p>💰 ${s.valor}</p>` : ''}
        ${s.obs   ? `<p>📝 ${s.obs}</p>`   : ''}
      </div>
    `).join('')
  : '<p class="vazio">Nenhuma sessão avulsa marcada.</p>';


  // ---- HTML: aba pacotes ----
  const pacotesHTML = pacotes.length > 0
    ? pacotes.map(p => {
        const realizadas = p.sessoesRealizadas || 0;
        const total      = p.totalSessoes || 0;
        const pct        = total > 0 ? Math.round((realizadas / total) * 100) : 0;
        const pagamentosDoPacote = AppStorage.pagamentos.filter(pg => pg.pacoteId === p.id);
        const totalPagoPacote = pagamentosDoPacote.reduce((a, pg) => a + pg.valor, 0);
        const saldoPacote = parseMoeda(p.valor) - totalPagoPacote;
        const hojeStrLoc = new Date().toISOString().slice(0, 10);
        return `
          <div class="sessao-card pacote-card">
            <div class="sessao-card-top">
              <strong>${p.servico}</strong>
              <span class="badge badge-${p.status}">${p.status}</span>
              <div style="display:flex;gap:2px">
                <button class="btn-editar-sessao" aria-label="Editar pacote" onclick="editarPacote(${cliente.id}, ${p.id})">✏️</button>
                <button class="btn-excluir-sessao" aria-label="Excluir pacote" onclick="excluirPacote(${cliente.id}, ${p.id})">🗑️</button>
              </div>
            </div>
            <div class="progresso-bar">
              <div class="progresso-fill" style="width:${pct}%"></div>
            </div>
            <p class="progresso-label">${realizadas} de ${total} sessões realizadas</p>
            <p>💰 Total: ${p.valor || '—'} | 💳 Pago: ${formatMoeda(totalPagoPacote)} | ⏳ Saldo: ${formatMoeda(saldoPacote)}</p>
            <div class="sessao-acoes" style="display:flex;gap:4px;flex-wrap:wrap">
              <button type="button" onclick="mostrarFormPagamento(${cliente.id}, ${p.id})">💳 Registrar Pagamento</button>
              <button type="button" onclick="toggleExtrato(${p.id})">📋 Extrato (${pagamentosDoPacote.length})</button>
            </div>
            <div id="form-pagamento-${p.id}" style="display:none;margin-top:8px">
              <label style="font-size:13px">Valor</label>
              <input id="pag-valor-${p.id}" oninput="mascaraValor(this)" style="width:100%">
              <label style="font-size:13px;margin-top:6px">Data</label>
              <input id="pag-data-${p.id}" type="date" value="${hojeStrLoc}" style="width:100%">
              <label style="font-size:13px;margin-top:6px">Observação</label>
              <textarea id="pag-obs-${p.id}" style="width:100%" rows="2"></textarea>
              <div style="display:flex;gap:4px;margin-top:6px">
                <button type="button" onclick="salvarPagamento(${cliente.id}, ${p.id})">💾 Salvar</button>
                <button type="button" onclick="cancelarFormPagamento(${p.id})">✖ Cancelar</button>
              </div>
            </div>
            <div id="extrato-${p.id}" style="display:none;margin-top:8px;font-size:13px;background:#f9f7f4;padding:8px;border-radius:6px">
              <strong>📋 Extrato — ${p.servico}</strong>
              ${pagamentosDoPacote.length > 0
                ? pagamentosDoPacote
                    .sort((a, b) => a.data.localeCompare(b.data))
                    .map(pg => `<p style="margin:4px 0">${pg.data} — ${formatMoeda(pg.valor)}${pg.obs ? ' — ' + pg.obs : ''}</p>`)
                    .join('')
                    + `<hr style="margin:6px 0"><p><strong>Total pago:</strong> ${formatMoeda(totalPagoPacote)} | <strong>Saldo:</strong> ${formatMoeda(saldoPacote)}</p>`
                : '<p style="margin:4px 0">Nenhum pagamento registrado.</p>'}
            </div>
            ${p.obs   ? `<p>📝 ${p.obs}</p>`   : ''}
            <div class="sessao-acoes">
              <button type="button" onclick="marcarSessaoPacote(${cliente.id}, ${p.id})">
                ✅ Marcar sessão do pacote
              </button>
            </div>
          </div>
        `;
      }).join('')
    : '<p class="vazio">Nenhum pacote contratado.</p>';

  const iniciais = cliente.nome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();

  info.innerHTML = `
    <h3>📋 Informações do Cliente</h3>

    <!-- ABAS -->
    <div class="abas-cliente">
      <button class="aba-btn ativa" onclick="trocarAbaCliente('info', this)">Info</button>
      <button class="aba-btn" onclick="trocarAbaCliente('sessoes', this)">
        Sessões (${sessoesAvulsas.length})
      </button>
      <button class="aba-btn" onclick="trocarAbaCliente('pacotes', this)">
        Pacotes (${pacotes.length})
      </button>
    </div>

    <!-- ABA INFO -->
    <div id="abaCliente-info" class="aba-painel ativa">
      <div id="modoVisualizar">
            <h4>${cliente.nome}</h4>
            ${cliente.telefone ? `<p>📞 ${cliente.telefone}</p>` : ''}
            ${cliente.cpf      ? `<p>🪪 ${cliente.cpf}</p>`            : ''}
            ${enderecoCompleto ? `<p>📍 ${enderecoCompleto}</p>`        : ''}
             <button onclick="modoEditar(${cliente.id})">✏️ Editar</button>
          </div>
        </div>
        
      </div>

      <div id="modoEditar" style="display:none">
        <h4>✏️ Editar Cliente</h4>
        <label>Nome</label>
        <input id="editNome"     value="${cliente.nome     || ''}">
        <label>Telefone</label>
        <input id="editTelefone" value="${cliente.telefone || ''}">
        <label>CPF</label>
        <input id="editCpf"      value="${cliente.cpf      || ''}">
        <label>Endereço</label>
        <input id="editEndereco" maxlength="100" value="${cliente.endereco || ''}">
        <label>Número</label>
        <input id="editNumero" maxlength="10"  value="${cliente.numero   || ''}">
        <label>CEP</label>
        <input id="editCep"      value="${cliente.cep      || ''}">
        <div class="sessao-acoes">
          <button onclick="salvarEdicaoCliente(${cliente.id})">💾 Salvar</button>
          <button onclick="modoVisualizar()">✖️ Cancelar</button>
        </div>
      </div>
    </div>

    <!-- ABA SESSÕES -->
    <div id="abaCliente-sessoes" class="aba-painel" style="display:none">
      ${sessoesHTML}
    </div>

    <!-- ABA PACOTES -->
    <div id="abaCliente-pacotes" class="aba-painel" style="display:none">
      ${pacotesHTML}
    </div>
  `;

  popover.style.display = 'flex';
}

function excluirSessao(clienteId, sessaoId) {
  if (!confirm('Excluir esta sessão?')) return;

  AppStorage.sessoes = AppStorage.sessoes.filter(s => s.id !== sessaoId);

  const cliente = AppStorage.clientes.find(c => c.id === clienteId);
  AppStorage.salvarDados();
  if (cliente) abrirPopover(cliente);
}

function excluirPacote(clienteId, pacoteId) {
  if (!confirm('Excluir este pacote?')) return;

  AppStorage.sessoes = AppStorage.sessoes.filter(s => s.id !== pacoteId);

  const cliente = AppStorage.clientes.find(c => c.id === clienteId);
  AppStorage.salvarDados();
  if (cliente) abrirPopover(cliente);
}

function trocarAbaCliente(id, el) {
  document.querySelectorAll('.aba-painel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('ativa'));
  document.getElementById('abaCliente-' + id).style.display = 'flex';
  el.classList.add('ativa');
}

function mostrarFormPagamento(clienteId, pacoteId) {
  const form = document.getElementById('form-pagamento-' + pacoteId);
  if (form) form.style.display = 'block';
}

function cancelarFormPagamento(pacoteId) {
  const form = document.getElementById('form-pagamento-' + pacoteId);
  if (form) form.style.display = 'none';
}

function salvarPagamento(clienteId, pacoteId) {
  const valorInput = document.getElementById('pag-valor-' + pacoteId);
  const dataInput = document.getElementById('pag-data-' + pacoteId);
  const obsInput = document.getElementById('pag-obs-' + pacoteId);
  if (!valorInput || !dataInput) { console.warn('[Pagamento] Formulário não encontrado'); return; }

  const valorNumerico = parseMoeda(valorInput.value);
  if (!valorInput.value || valorNumerico <= 0) {
    alert('Informe um valor válido.');
    valorInput.focus();
    return;
  }

  const pacote = AppStorage.sessoes.find(s => s.id === pacoteId);
  if (pacote) {
    const pagoAteAgora = AppStorage.pagamentos
      .filter(pg => pg.pacoteId === pacoteId)
      .reduce((a, pg) => a + pg.valor, 0);
    const totalPacote = parseMoeda(pacote.valor);
    if (pagoAteAgora + valorNumerico > totalPacote) {
      if (!confirm(`O total pago (${formatMoeda(pagoAteAgora + valorNumerico)}) excederá o valor do pacote (${pacote.valor}). Continuar?`)) return;
    }
  }

  AppStorage.pagamentos.push({
    id: Date.now(),
    pacoteId: pacoteId,
    clienteId: clienteId,
    valor: valorNumerico,
    data: dataInput.value,
    obs: obsInput ? obsInput.value.trim() : '',
    user_id: AppStorage.currentUserId,
    updated_at: new Date().toISOString()
  });

  AppStorage.salvarDados();

  const cliente = AppStorage.clientes.find(c => c.id === clienteId);
  if (cliente) abrirPopover(cliente);
}

function toggleExtrato(pacoteId) {
  const el = document.getElementById('extrato-' + pacoteId);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

window.mostrarFormPagamento = mostrarFormPagamento;
window.cancelarFormPagamento = cancelarFormPagamento;
window.salvarPagamento = salvarPagamento;
window.toggleExtrato = toggleExtrato;


