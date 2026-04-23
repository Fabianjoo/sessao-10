/* BANCO DE CLIENTES */
let clientes = [];

// Carrega do localStorage ao iniciar
function salvarDados() {
  localStorage.setItem('clientes', JSON.stringify(clientes));
  localStorage.setItem('sessoes',  JSON.stringify(sessoes));
}

function carregarDados() {
  const c = localStorage.getItem('clientes');
  const s = localStorage.getItem('sessoes');
  if (c) clientes = JSON.parse(c);
  if (s) sessoes  = JSON.parse(s);
}

function truncar(texto, limite) {
  return texto.length > limite ? texto.slice(0, limite) + '...' : texto;
}

function renderizarClientes() {
  const conteiner = document.querySelector('.clientesConteiner');
  conteiner.innerHTML = '';

  clientes.forEach(cliente => {
    let enderecoCompleto = '';
    if (cliente.endereco) enderecoCompleto += cliente.endereco;

    const card = document.createElement('div');
    card.classList.add('cliente-card');
    card.innerHTML = `
      <h4>${truncar(cliente.nome, 25)}</h4>
      ${cliente.telefone ? `<p>📞 ${cliente.telefone}</p>` : ''}
      ${enderecoCompleto ? `<p>📍 ${truncar(enderecoCompleto, 23)}</p>` : ''}
    `;

    card.dataset.id = cliente.id;
    card.addEventListener('click', function() {
      const c = clientes.find(c => c.id === Number(this.dataset.id));
      abrirPopover(c);
    });

    conteiner.appendChild(card);
  });
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

  const novoCliente = {
    id: Date.now(),
    nome,
    telefone,
    cpf,
    endereco,
    cep,
    numero,
    sessoes: []
  };

  clientes.push(novoCliente);
  salvarDados();
  renderizarClientes();
  document.getElementById('clienteForm').reset();
}

// Inicializa
carregarDados();
renderizarClientes();