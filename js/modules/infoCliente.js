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
          <button class="btn-excluir-sessao" onclick="excluirSessao(${cliente.id}, ${s.id})">🗑️</button>
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
        return `
          <div class="sessao-card pacote-card">
            <div class="sessao-card-top">
              <strong>${p.servico}</strong>
              <span class="badge badge-${p.status}">${p.status}</span>
              <button class="btn-excluir-sessao" onclick="excluirPacote(${cliente.id}, ${p.id})">🗑️</button>
            </div>
            <div class="progresso-bar">
              <div class="progresso-fill" style="width:${pct}%"></div>
            </div>
            <p class="progresso-label">${realizadas} de ${total} sessões realizadas</p>
            ${p.valor ? `<p>💰 ${p.valor}</p>` : ''}
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


