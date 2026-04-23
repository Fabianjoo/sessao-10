function abrirPopoverSessao() {
  
    document.querySelector('.popoverSessao').style.display = 'flex';
  }
  
  function fecharPopoverSessao() {
    document.querySelector('.popoverSessao').style.display = 'none';
  }
  
  // Fechar clicando fora
  document.querySelector('.popoverSessao').addEventListener('click', function(e) {
    if (e.target === this) fecharPopoverSessao();
  });


  /* BANCO DE SESSÕES */
const sessoes = [];

/* FORM SESSAO */
let clienteSelecionadoId = null;

function mostrarClientes(filtro = '') {
  const dropdown = document.getElementById('clientesDropdown');
  if (!dropdown) return;
  dropdown.innerHTML = '';

  const lista = clientes.filter(c =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  if (lista.length === 0) {
    dropdown.innerHTML = '<div>Nenhum cliente encontrado</div>';
  } else {
    lista.forEach(c => {
      const item = document.createElement('div');
      item.classList.add('dropdown-option');
      item.textContent = c.nome;
      item.onclick = () => selecionarCliente(c.id, c.nome);
      dropdown.appendChild(item);
    });
  }
}

function filtrarClientes() {
  mostrarClientes(document.getElementById('clienteSessao').value);
}

function selecionarCliente(id, nome) {
  clienteSelecionadoId = id;
  document.getElementById('clienteSessao').value = nome;
  document.getElementById('clientesDropdown').innerHTML = '';
}

function mascaraValor(input) {
  let v = input.value.replace(/\D/g, '');
  v = (Number(v) / 100).toFixed(2);
  input.value = 'R$ ' + v.replace('.', ',');
}

function cadastrarSessao() {
  if (!clienteSelecionadoId) { alert('⚠️ Selecione um cliente.'); return; }

  const servico = document.getElementById('servicoSessao').value.trim();
  const valor   = document.getElementById('valorSessao').value.trim();
  const data    = document.getElementById('dataSessao').value;
  const hora    = document.getElementById('horaSessao').value;
  const obs     = document.getElementById('obsSessao').value.trim();

  if (!servico || !data || !hora) { alert('⚠️ Preencha serviço, data e horário.'); return; }

  const cliente = clientes.find(c => c.id === clienteSelecionadoId);

  const novaSessao = {
    id: Date.now(),
    clienteId: clienteSelecionadoId,
    nomeCliente: cliente.nome,
    servico,
    valor,
    data,
    hora,
    obs,
    status: 'agendada'
  };

  sessoes.push(novaSessao);
  cliente.sessoes.push(novaSessao);

  console.log('Sessões:', sessoes);
  salvarDados(); // 👈 salva tudo
  alert(`✅ Sessão cadastrada para ${cliente.nome}!`);
  fecharPopoverSessao();
}

function fecharPopoverSessao() {
  clienteSelecionadoId = null;
  document.getElementById('clienteSessao').value   = '';
  document.getElementById('servicoSessao').value   = '';
  document.getElementById('valorSessao').value     = '';
  document.getElementById('dataSessao').value      = '';
  document.getElementById('horaSessao').value      = '';
  document.getElementById('obsSessao').value       = '';
  document.getElementById('clientesDropdown').innerHTML = '';
  document.querySelector('.popoverSessao').style.display = 'none';
}

function abrirPopoverSessao() {
  // Reseta cliente selecionado
  clienteSelecionadoId = null;
  document.getElementById('clienteSessao').value = '';

  // Abre o popover
  document.querySelector('.popoverSessao').style.display = 'flex';

  // Já mostra todos os clientes
  mostrarClientes();
}