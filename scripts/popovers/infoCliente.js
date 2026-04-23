function abrirPopover(cliente) {
    const popover = document.querySelector('.popoverCliente');
    const info = document.querySelector('.infoCliente');
  
    let enderecoCompleto = '';
    if (cliente.endereco) enderecoCompleto += cliente.endereco;
    if (cliente.numero)   enderecoCompleto += `, ${cliente.numero}`;
    if (cliente.cep)      enderecoCompleto += ` - CEP: ${cliente.cep}`;
  
    const sessoesHTML = cliente.sessoes.length > 0
      ? cliente.sessoes.map(s => `
          <div class="sessao-card">
            <p>💆 <strong>${s.servico}</strong></p>
            <p>📅 ${s.data} às ${s.hora}</p>
            ${s.valor ? `<p>💰 ${s.valor}</p>` : ''}
            ${s.obs   ? `<p>📝 ${s.obs}</p>`   : ''}
            <p>🔖 ${s.status}</p>
          </div>
        `).join('')
      : '<p>Nenhuma sessão marcada.</p>';
  
    info.innerHTML = `
      <h3>📋 Informações do Cliente</h3>
  
      <!-- MODO VISUALIZAÇÃO -->
      <div class="popover-info" id="modoVisualizar">
        <h4>👤 ${cliente.nome}</h4>
        ${cliente.telefone ? `<p>📞 ${cliente.telefone}</p>` : ''}
        ${cliente.cpf      ? `<p>🪪 ${cliente.cpf}</p>`      : ''}
        ${enderecoCompleto ? `<p>📍 ${enderecoCompleto}</p>`  : ''}
        <button onclick="modoEditar(${cliente.id})">✏️ Editar</button>
      </div>
  
      <!-- MODO EDIÇÃO -->
      <div class="popover-info" id="modoEditar" style="display:none">
        <h4>✏️ Editar Cliente</h4>
        <label>Nome</label>
        <input id="editNome"     value="${cliente.nome     || ''}">
        <label>Telefone</label>
        <input id="editTelefone" value="${cliente.telefone || ''}">
        <label>CPF</label>
        <input id="editCpf"      value="${cliente.cpf      || ''}">
        <label>Endereço</label>
        <input id="editEndereco" value="${cliente.endereco || ''}">
        <label>Número</label>
        <input id="editNumero"   value="${cliente.numero   || ''}">
        <label>CEP</label>
        <input id="editCep"      value="${cliente.cep      || ''}">
        <div class="sessao-acoes">
          <button onclick="salvarEdicaoCliente(${cliente.id})">💾 Salvar</button>
          <button onclick="modoVisualizar()">✖️ Cancelar</button>
        </div>
      </div>
  
      <hr>
  
      <div class="popover-sessoes">
        <h4>📅 Sessões Agendadas</h4>
        ${sessoesHTML}
      </div>
    `;
  
    popover.style.display = 'flex';
  }
  
  
  function modoEditar(id) {
    document.getElementById('modoVisualizar').style.display = 'none';
    document.getElementById('modoEditar').style.display     = 'block';
  }
  
  function modoVisualizar() {
    document.getElementById('modoVisualizar').style.display = 'block';
    document.getElementById('modoEditar').style.display     = 'none';
  }
  
  function salvarEdicaoCliente(id) {
    const index = clientes.findIndex(c => c.id === id);
    if (index === -1) return;
  
    clientes[index] = {
      ...clientes[index],
      nome:     document.getElementById('editNome').value,
      telefone: document.getElementById('editTelefone').value,
      cpf:      document.getElementById('editCpf').value,
      endereco: document.getElementById('editEndereco').value,
      numero:   document.getElementById('editNumero').value,
      cep:      document.getElementById('editCep').value,
    };
  
    salvarDados();
    renderizarClientes();
    abrirPopover(clientes[index]); // recarrega o popover com dados atualizados
  }
  
  
  function fecharPopover() {
    document.querySelector('.popoverCliente').style.display = 'none';
  }
  
  document.querySelector('.popoverCliente').addEventListener('click', function(e) {
    if (e.target === this) fecharPopover();
  });