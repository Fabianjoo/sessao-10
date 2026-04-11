// ===============================
// ABRIR / FECHAR POPOVER
// ===============================
const btnAbrirItens = document.getElementById("btnPopoverItens");
const popoverItens = document.querySelector(".itensManuaisPopover");
const contentItens = document.querySelector("#itensManuais");

btnAbrirItens.addEventListener("click", (e) => {
  e.stopPropagation();
  popoverItens.style.display = "flex";
});

// 🔥 BLOQUEIA CLIQUES DENTRO DO POPOVER
contentItens.addEventListener("click", (e) => {
  e.stopPropagation();
});

// fechar clicando fora
document.addEventListener("click", (e) => {
  if (
    popoverItens.style.display === "flex" &&
    !contentItens.contains(e.target) &&
    e.target !== btnAbrirItens
  ) {
    popoverItens.style.display = "none";
  }
});

// ===============================
// ITENS MANUAIS
// ===============================
let itensAvulsos = [];

document.getElementById("addItemAvulso").addEventListener("click", (e) => {
  e.preventDefault();

  const nome = document.getElementById("itemAvulso").value.trim();
  const preco = parseFloat(document.getElementById("precoAvulso").value);
  const qtd = parseInt(document.getElementById("quantidadeAvulso").value);

  if (!nome || isNaN(preco) || isNaN(qtd) || qtd <= 0) {
    alert("Preencha corretamente!");
    return;
  }

  const item = { nome, preco, qtd };

  itensAvulsos.push(item);

  renderizarItensAvulsos();
  atualizarTotal();

  // limpar campos
  document.getElementById("itemAvulso").value = "";
  document.getElementById("precoAvulso").value = "";
  document.getElementById("quantidadeAvulso").value = 1;
});

// ===============================
// RENDERIZAR ITENS
// ===============================
function renderizarItensAvulsos() {
  const container = document.querySelector(".itemAvulso");
  container.innerHTML = "";

  itensAvulsos.forEach((item, index) => {
    const div = document.createElement("div");
    div.style.marginBottom = "5px";

    const texto = document.createElement("span");
    texto.textContent = `${item.nome} - R$ ${item.preco.toFixed(2)} x ${item.qtd}`;

    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.style.marginLeft = "10px";

    // 🔥 IMPEDIR FECHAR POPOVER AO CLICAR
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      removerItemAvulso(index);
    });

    div.appendChild(texto);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

// ===============================
// REMOVER ITEM
// ===============================
function removerItemAvulso(index) {
  itensAvulsos.splice(index, 1);
  renderizarItensAvulsos();
  atualizarTotal();
}

// ===============================
// TOTAL (CARDÁPIO + MANUAL)
// ===============================
function atualizarTotal() {
  let total = 0;

  // ITENS DO CARDÁPIO
  const itens = document.querySelectorAll(".item-cardapio");

  itens.forEach(item => {
    const preco = parseFloat(item.dataset.preco);
    const qtd = parseInt(item.querySelector(".qtd").value) || 0;

    total += preco * qtd;
  });

  // ITENS MANUAIS 🔥
  itensAvulsos.forEach(item => {
    total += item.preco * item.qtd;
  });

  document.getElementById("total").textContent =
    total.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
}