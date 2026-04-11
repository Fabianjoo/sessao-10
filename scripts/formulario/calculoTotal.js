function atualizarTotal() {
    let total = 0;
  
    const itens = document.querySelectorAll(".item-cardapio");
  
    itens.forEach(item => {
      const preco = parseFloat(item.dataset.preco);
      const qtd = parseInt(item.querySelector(".qtd").value) || 0;
  
      total += preco * qtd;
    });
  
    document.getElementById("total").textContent =
      total.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
  }