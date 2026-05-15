let _idCancelando = null;

function cancelarSessao(id) {
  _idCancelando = id;
  document.getElementById('motivo-cancelamento').value = '';
  document.getElementById('contador-motivo').textContent = '0';
  document.getElementById('modal-cancelar').style.display = 'flex';
}

function fecharModalCancelar() {
  _idCancelando = null;
  document.getElementById('modal-cancelar').style.display = 'none';
}

function confirmarCancelamento() {
  const motivo = document.getElementById('motivo-cancelamento').value.trim();
  if (!motivo) {
    alert('Informe o motivo do cancelamento.');
    return;
  }

  const sessao = AppStorage.sessoes.find(s => s.id === _idCancelando);
  if (!sessao) return;

  sessao.status = 'cancelada';
  sessao.observacaoCancelamento = motivo;
  sessao.dataCancelamento = new Date().toISOString();

  const cliente = AppStorage.clientes.find(c => c.id === sessao.clienteId);
  if (cliente && cliente.sessoes) {
    const s = cliente.sessoes.find(s => s.id === _idCancelando);
    if (s) {
      s.status = 'cancelada';
      s.observacaoCancelamento = motivo;
    }
  }

  fecharModalCancelar();
  AppStorage.salvarDados();
  atualizarSessoesHoje();
  renderCalendario();
  renderHistorico();
  renderDashboard();
}

window.cancelarSessao = cancelarSessao;
window.fecharModalCancelar = fecharModalCancelar;
window.confirmarCancelamento = confirmarCancelamento;

document.getElementById('motivo-cancelamento').addEventListener('input', function() {
  document.getElementById('contador-motivo').textContent = this.value.length;
});