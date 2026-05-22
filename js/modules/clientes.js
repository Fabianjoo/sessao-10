

// ==================== UTILITÁRIOS ====================
function truncar(texto, limite) {
  if (!texto) return '';
  const str = String(texto);
  return str.length > limite ? str.slice(0, limite) + '...' : str;
}

// ==================== CLIENTES ====================
function renderizarClientes() {
  const conteiner = document.querySelector('.clientesConteiner');
  if (!conteiner) return;
  conteiner.innerHTML = '';

  AppStorage.clientes.forEach(cliente => {
    let enderecoCompleto = '';
    if (cliente.endereco) enderecoCompleto += cliente.endereco;

    const card = document.createElement('div');
    card.classList.add('cliente-card');
    card.innerHTML = `
      <button class="btn-excluir" onclick="excluirCliente(${cliente.id}, event)">🗑️</button>
      <h4>${truncar(cliente.nome, 25)}</h4>
      ${cliente.telefone ? `<p>📞 ${cliente.telefone}</p>` : ''}
      ${enderecoCompleto ? `<p>📍 ${truncar(enderecoCompleto, 23)}</p>` : ''}
    `;

    card.dataset.id = cliente.id;
    card.addEventListener('click', function() {
      const c = AppStorage.clientes.find(c => c.id === Number(this.dataset.id));
      if (c) abrirPopover(c);
    });

    conteiner.appendChild(card);
  });
}

function excluirCliente(id, event) {
  event.stopPropagation(); // evita abrir o popover ao clicar na lixeira
  if (!confirm('Excluir este cliente?')) return;

  const agoraMs = new Date().getTime();
  const idNum = Number(id);

  // Remove o cliente da lista
  AppStorage.clientes = AppStorage.clientes.filter(c => Number(c.id) !== idNum);

  // Filtra as sessões: mantém sessões de outros AppStorage.clientes e o que for histórico/andamento deste
  AppStorage.sessoes = AppStorage.sessoes.filter(s => {
    if (Number(s.clienteId) !== idNum) return true;
    
    // Para o cliente que está sendo excluído, mantemos apenas o histórico ou o que está em andamento
    const status = getStatus(s, agoraMs);
    const ehHistoricoOuAndamento = s.finalizada || s.status === 'cancelada' || status === 'concluida' || status === 'andamento';
    
    // Mantém apenas se for histórico ou em andamento
    return ehHistoricoOuAndamento;
  });

  AppStorage.salvarDados();
  renderizarClientes();
  
  // Atualiza as visualizações
  if (window.renderDashboard) renderDashboard();
  if (window.atualizarSessoesHoje) atualizarSessoesHoje();
  if (window.renderCalendario) renderCalendario();
  if (window.renderHistorico) renderHistorico();
}

function cadastrarCliente() {
  const nome     = document.getElementById('nomeCliente').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const cpf      = document.getElementById('cpf').value.trim();
  const endereco = document.getElementById('endereco').value.trim();
  const cep      = document.getElementById('cep').value.trim();
  const numero   = document.getElementById('numero').value.trim();

  if (!nome) {
    alert('⚠️ Por favor, preencha o nome do cliente.');
    return;
  }

  if (telefone.length < 14) {
    alert('⚠️ Por favor, preencha o telefone do cliente corretamente.');
    return;
  }

  if (cpf && cpf.length < 14) {
    alert('⚠️ O CPF informado está incompleto.');
    return;
  }

  const novoCliente = {
    id: Date.now(),
    user_id: AppStorage.currentUserId,
    nome,
    telefone,
    cpf,
    endereco,
    cep,
    numero
  };

  AppStorage.clientes.push(novoCliente);
  AppStorage.salvarDados();
  renderizarClientes();
  if (window.renderDashboard) renderDashboard();
  document.getElementById('clienteForm').reset();
}

window.renderizarClientes = renderizarClientes;
window.excluirCliente = excluirCliente;
window.cadastrarCliente = cadastrarCliente;
window.abrirPopoverSessao = abrirPopoverSessao;
window.fecharPopoverSessao = fecharPopoverSessao;
window.cadastrarSessao = cadastrarSessao;
window.setTipoSessao = setTipoSessao;
window.filtrarClientes = filtrarClientes;
window.filtrarClientesLista = filtrarClientesLista;
window.fecharPopover = fecharPopover;
window.modoEditar = modoEditar;
window.modoVisualizar = modoVisualizar;
window.salvarEdicaoCliente = salvarEdicaoCliente;
window.marcarSessaoPacote = marcarSessaoPacote;
window.selecionarCliente = selecionarCliente;

// ==================== POPOVER CLIENTE ====================
function fecharPopover() {
  document.querySelector('.popoverCliente').style.display = 'none';
}

function modoEditar(id) {
  document.getElementById('modoVisualizar').style.display = 'none';
  document.getElementById('modoEditar').style.display     = 'block';
  document.querySelector('.abas-cliente').style.display   = 'none';
  document.querySelector('#abaCliente-info').style.display   = 'none';

  // máscaras aplicadas após os inputs existirem no DOM
  document.getElementById('editTelefone').addEventListener('input', function(e) {
    if (e.inputType === 'deleteContentBackward') return;
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    let r = '';
    if (v.length > 0) r += '(' + v.slice(0, 2);
    if (v.length >= 2) r += ') ' + v.slice(2, 7);
    if (v.length >= 7) r += '-' + v.slice(7, 11);
    e.target.value = r;
  });

  document.getElementById('editCpf').addEventListener('input', function(e) {
    if (e.inputType === 'deleteContentBackward') return;
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    let r = '';
    if (v.length > 0) r += v.slice(0, 3);
    if (v.length >= 3) r += '.' + v.slice(3, 6);
    if (v.length >= 6) r += '.' + v.slice(6, 9);
    if (v.length >= 9) r += '-' + v.slice(9, 11);
    e.target.value = r;
  });

  document.getElementById('editCep').addEventListener('input', function(e) {
    if (e.inputType === 'deleteContentBackward') return;
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    let r = '';
    if (v.length > 0) r += v.slice(0, 5);
    if (v.length >= 5) r += '-' + v.slice(5, 8);
    e.target.value = r;
  });

  document.getElementById('editNumero').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  document.getElementById('editNome').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s\-\']/g, '');
  });
}

function modoVisualizar() {
  document.getElementById('modoVisualizar').style.display = 'block';
  document.getElementById('modoEditar').style.display     = 'none';
  document.querySelector('.abas-cliente').style.display   = 'flex';
  document.querySelector('#abaCliente-info').style.display   = 'flex';
}

function salvarEdicaoCliente(id) {
  const index = AppStorage.clientes.findIndex(c => c.id === id);
  if (index === -1) return;

  const nome     = document.getElementById('editNome').value.trim();
  const telefone = document.getElementById('editTelefone').value.trim();
  const cpf      = document.getElementById('editCpf').value.trim();
  const cep      = document.getElementById('editCep').value.trim();

  if (!nome) {
    alert('⚠️ O nome do cliente é obrigatório.');
    return;
  }

  if (telefone.length < 14) {
    alert('⚠️ Por favor, preencha o telefone do cliente corretamente.');
    return;
  }

  if (cpf && cpf.length < 14) {
    alert('⚠️ O CPF informado está incompleto.');
    return;
  }

  if (cep && cep.length < 9) {
    alert('⚠️ O CEP informado está incompleto.');
    return;
  }

  AppStorage.clientes[index] = {
    ...AppStorage.clientes[index],
    nome,
    telefone,
    cpf,
    endereco: document.getElementById('editEndereco').value,
    numero:   document.getElementById('editNumero').value,
    cep:      document.getElementById('editCep').value,
  };

  AppStorage.salvarDados();
  abrirPopover(AppStorage.clientes[index]);
  document.querySelector('#abaCliente-info').style.display   = 'flex';
}

// ==================== POPOVER SESSÃO ====================
let clienteSelecionadoId = null;
let pacoteAtualId        = null;
let tipoSessaoAtual      = 'avulsa';

function abrirPopoverSessao() {
  document.getElementById('servicoSessao').removeAttribute('readonly');
  clienteSelecionadoId = null;
  pacoteAtualId        = null;
  document.getElementById('clienteSessao').value        = '';
  document.getElementById('servicoSessao').value        = '';
  document.getElementById('valorSessao').value          = '';
  document.getElementById('dataSessao').value           = '';
  document.getElementById('horaSessao').value           = '';
  document.getElementById('obsSessao').value            = '';
  document.getElementById('qtdSessoesPacote').value     = '';
  document.getElementById('valorPacote').value          = '';
  document.getElementById('obsPacote').value            = '';
  document.getElementById('clientesDropdown').innerHTML = '';
  setTipoSessao('avulsa');
  document.querySelector('.popoverSessao').style.display = 'flex';
  mostrarClientes();
}

function fecharPopoverSessao() {
  clienteSelecionadoId = null;
  pacoteAtualId        = null;
  document.getElementById('clienteSessao').value        = '';
  document.getElementById('servicoSessao').value        = '';
  document.getElementById('valorSessao').value          = '';
  document.getElementById('dataSessao').value           = '';
  document.getElementById('horaSessao').value           = '';
  document.getElementById('obsSessao').value            = '';
  document.getElementById('qtdSessoesPacote').value     = '';
  document.getElementById('valorPacote').value          = '';
  document.getElementById('obsPacote').value            = '';
  document.getElementById('clientesDropdown').innerHTML = '';
  document.querySelector('.popoverSessao').style.display = 'none';

  // Restaura o campo valor para sessões avulsas normais
  const labelValor = document.querySelector('label[for="valorSessao"]');
  const inputValor = document.getElementById('valorSessao');
  if (labelValor) labelValor.style.display = '';
  if (inputValor) inputValor.style.display = '';
}

function setTipoSessao(tipo) {
  tipoSessaoAtual = tipo;
  document.querySelectorAll('.tipo-tab').forEach(btn => {
    btn.classList.toggle('ativo', btn.dataset.tipo === tipo);
  });
  document.getElementById('campos-avulsa').style.display = tipo === 'avulsa' ? '' : 'none';
  document.getElementById('campos-pacote').style.display = tipo === 'pacote' ? '' : 'none';
}

function mostrarClientes(filtro = '') {
  const dropdown = document.getElementById('clientesDropdown');
  if (!dropdown) return;
  dropdown.innerHTML = '';

  const lista = AppStorage.clientes.filter(c =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  if (lista.length === 0) {
    dropdown.innerHTML = '<div class="dropdown-option">Nenhum cliente encontrado</div>';
    return;
  }

  lista.forEach(c => {
    const item = document.createElement('div');
    item.classList.add('dropdown-option');
    item.textContent = c.nome;
    item.onclick = () => selecionarCliente(c.id, c.nome);
    dropdown.appendChild(item);
  });
}

function filtrarClientes() {
  mostrarClientes(document.getElementById('clienteSessao').value);
}

function selecionarCliente(id, nome) {
  clienteSelecionadoId = id;
  document.getElementById('clienteSessao').value        = nome;
  document.getElementById('clientesDropdown').innerHTML = '';
}


function marcarSessaoPacote(clienteId, pacoteId) {
  const cliente = AppStorage.clientes.find(c => c.id === clienteId);
  if (!cliente) return;

  const pacote = AppStorage.sessoes.find(s => s.clienteId === clienteId && s.id === pacoteId);
  if (!pacote) return;

  if ((pacote.sessoesRealizadas || 0) >= pacote.totalSessoes) {
    alert('⚠️ Todas as sessões deste pacote já foram realizadas.');
    return;
  }

  fecharPopover();
  abrirPopoverSessao();

  clienteSelecionadoId = clienteId;
  document.getElementById('clienteSessao').value        = cliente.nome;
  document.getElementById('clientesDropdown').innerHTML = '';
  pacoteAtualId = pacoteId;

  // Preenche o serviço e torna somente leitura
  const inputServico = document.getElementById('servicoSessao');
  inputServico.value = pacote.servico;
  inputServico.setAttribute('readonly', true);

  // Oculta o campo valor pois o pacote já foi pago
  const labelValor = document.querySelector('label[for="valorSessao"]');
  const inputValor = document.getElementById('valorSessao');
  if (labelValor) labelValor.style.display = 'none';
  if (inputValor) inputValor.style.display = 'none';
}

function cadastrarSessao() {
  if (!clienteSelecionadoId) { alert('⚠️ Selecione um cliente.'); return; }

  const servico = document.getElementById('servicoSessao').value.trim();
  if (!servico) { alert('⚠️ Preencha o serviço.'); return; }

  const cliente = AppStorage.clientes.find(c => c.id === clienteSelecionadoId);
  let novoRegistro;

  if (tipoSessaoAtual === 'avulsa') {
    const valor = document.getElementById('valorSessao').value.trim();
    const data  = document.getElementById('dataSessao').value;
    const hora  = document.getElementById('horaSessao').value;
    const obs   = document.getElementById('obsSessao').value.trim();

    if (!data || !hora) { alert('⚠️ Preencha data e horário.'); return; }

    const inputValor = document.getElementById('valorSessao');
    if (!valor && inputValor.style.display !== 'none') { alert('⚠️ Preencha o valor da sessão.'); return; } // ← corrigido

    novoRegistro = {
      id: Date.now(),
      user_id: AppStorage.currentUserId,
      tipo: 'avulsa',
      pacoteId: pacoteAtualId || null,
      clienteId: clienteSelecionadoId,
      nomeCliente: cliente.nome,
      servico, valor, data, hora, obs,
      status: 'agendada'
    };

    if (pacoteAtualId) {
      const pacote = AppStorage.sessoes.find(s => s.clienteId === clienteSelecionadoId && s.id === pacoteAtualId);
      if (pacote) pacote.sessoesRealizadas = (pacote.sessoesRealizadas || 0) + 1;
    }

  } else {
    const qtd   = parseInt(document.getElementById('qtdSessoesPacote').value);
    const valor = document.getElementById('valorPacote').value.trim();
    const obs   = document.getElementById('obsPacote').value.trim();

    if (!qtd || qtd < 1) { alert('⚠️ Informe a quantidade de sessões.'); return; }
    if (!valor) { alert('⚠️ Preencha o valor do pacote.'); return; }

    novoRegistro = {
      id: Date.now(),
      user_id: AppStorage.currentUserId,
      tipo: 'pacote',
      clienteId: clienteSelecionadoId,
      nomeCliente: cliente.nome,
      servico,
      totalSessoes: qtd,
      sessoesRealizadas: 0,
      valor, obs,
      status: 'ativo',
      dataCadastro: new Date().toISOString().slice(0, 10)
    };
  }

  AppStorage.sessoes.push(novoRegistro);

  AppStorage.salvarDados();
  renderDashboard();
  if (typeof atualizarSessoesHoje === 'function') atualizarSessoesHoje();
  if (typeof renderCalendario === 'function') renderCalendario();
  if (typeof renderHistorico === 'function') renderHistorico();
  
  alert(`✅ ${tipoSessaoAtual === 'avulsa' ? 'Sessão cadastrada' : 'Pacote cadastrado'} para ${cliente.nome}!`);
  fecharPopoverSessao();
}

// ==================== LISTENERS ====================
document.querySelector('.popoverCliente').addEventListener('click', function(e) {
  if (e.target === this) fecharPopover();
});

document.querySelector('.popoverSessao').addEventListener('click', function(e) {
  if (e.target === this) fecharPopoverSessao();
});

// ==================== INICIALIZAÇÃO ====================


// FILTRAR CLIENTE

function filtrarClientesLista() {
  const termo = document.getElementById('BuscarCliente').value.trim().toLowerCase();
  const conteiner = document.querySelector('.clientesConteiner');
  conteiner.innerHTML = '';

const filtrados = AppStorage.clientes.filter(c => {
  return (
    c.nome?.toLowerCase().includes(termo)     ||
    c.telefone?.toLowerCase().includes(termo) ||
    c.cep?.toLowerCase().includes(termo)      ||
    c.cpf?.toLowerCase().includes(termo)
  );
});

  if (filtrados.length === 0) {
    conteiner.innerHTML = '<p class="vazio">Nenhum cliente encontrado.</p>';
    return;
  }

  filtrados.forEach(cliente => {
    let enderecoCompleto = '';
    if (cliente.endereco) enderecoCompleto += cliente.endereco;

    const card = document.createElement('div');
    card.classList.add('cliente-card');
    card.innerHTML = `
      <button class="btn-excluir" onclick="excluirCliente(${cliente.id}, event)">🗑️</button>
      <h4>${truncar(cliente.nome, 25)}</h4>
      ${cliente.telefone ? `<p>📞 ${cliente.telefone}</p>` : ''}
      ${enderecoCompleto ? `<p>📍 ${truncar(enderecoCompleto, 23)}</p>` : ''}
    `;

    card.dataset.id = cliente.id;
    card.addEventListener('click', function () {
      const c = AppStorage.clientes.find(c => c.id === Number(this.dataset.id));
      abrirPopover(c);
    });

    conteiner.appendChild(card);
  });
}