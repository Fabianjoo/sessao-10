function atualizarTotal() {
  let total = 0;

  // ===============================
  // ITENS DO CARDÁPIO
  // ===============================
  const itens = document.querySelectorAll(".item-cardapio");

  itens.forEach(item => {
    const preco = parseFloat(item.dataset.preco);
    const qtd = parseInt(item.querySelector(".qtd").value) || 0;

    total += preco * qtd;
  });

  // ===============================
  // ITENS MANUAIS 🔥
  // ===============================
  itensAvulsos.forEach(item => {
    total += item.preco * item.qtd;
  });

  // ===============================
  // ATUALIZAR NA TELA
  // ===============================
  document.getElementById("total").textContent =
    total.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
}