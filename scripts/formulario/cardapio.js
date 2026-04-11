const btn = document.getElementById("addProduto");
const lista = document.getElementById("listaCardapio");

let itemArrastado = null;
let indicador = document.createElement("div");
indicador.classList.add("linha-indicador");

// =======================
// ATUALIZAR TOTAL
// =======================
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

// =======================
// SEGURAR BOTÃO
// =======================
function segurarBotao(botao, acao) {
  let interval;
  let timeout;

  botao.addEventListener("mousedown", () => {
    acao();

    timeout = setTimeout(() => {
      interval = setInterval(acao, 100);
    }, 300);
  });

  const parar = () => {
    clearInterval(interval);
    clearTimeout(timeout);
  };

  botao.addEventListener("mouseup", parar);
  botao.addEventListener("mouseleave", parar);
}

// =======================
// ADICIONAR PRODUTO
// =======================
btn.addEventListener("click", () => {
  const nome = document.getElementById("inputCardapio").value.trim();
  const preco = document.getElementById("preco").value;

  if (!nome || !preco) return;

  const item = document.createElement("div");
  item.classList.add("item-cardapio");
  item.setAttribute("draggable", true);

  // 🔥 GUARDA PREÇO NO ELEMENTO
  item.dataset.preco = parseFloat(preco);

  item.innerHTML = `
    <span><strong>${nome}</strong> - R$ ${parseFloat(preco).toFixed(2)}</span>
    <div>
      <button type="button" class="menos">-</button>
      <input type="number" class="qtd" value="0" min="0">
      <button type="button" class="mais">+</button>
      <button type="button" class="excluir">🗑️</button>
    </div>
  `;

  const btnMais = item.querySelector(".mais");
  const btnMenos = item.querySelector(".menos");
  const inputQtd = item.querySelector(".qtd");
  const btnExcluir = item.querySelector(".excluir");

  const aumentar = () => {
    inputQtd.value = parseInt(inputQtd.value) + 1;
    atualizarTotal();
  };

  const diminuir = () => {
    if (parseInt(inputQtd.value) > 0) {
      inputQtd.value = parseInt(inputQtd.value) - 1;
      atualizarTotal();
    }
  };

  segurarBotao(btnMais, aumentar);
  segurarBotao(btnMenos, diminuir);

  inputQtd.addEventListener("input", () => {
    if (inputQtd.value === "" || inputQtd.value < 0) {
      inputQtd.value = 0;
    }
    atualizarTotal();
  });

  // excluir item
  btnExcluir.addEventListener("click", () => {
    const confirmar = confirm("Tem certeza que deseja excluir este produto?");
  
    if (confirmar) {
      item.style.opacity = "0";
      item.style.transition = "0.2s";
  
      setTimeout(() => {
        item.remove();
        atualizarTotal(); 
      }, 200);
    }
  });
  lista.appendChild(item);

  document.getElementById("inputCardapio").value = ""; 
  document.getElementById("preco").value = "";
  atualizarTotal();

  document.getElementById("inputCardapio").value = "";
  document.getElementById("preco").value = "";
});

// =======================
// DRAG AND DROP
// =======================

document.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("item-cardapio")) {
    itemArrastado = e.target;
    e.target.style.opacity = "0.5";
  }
});

lista.addEventListener("dragover", (e) => {
  e.preventDefault();

  const item = e.target.closest(".item-cardapio");
  if (!item || item === itemArrastado) return;

  const bounding = item.getBoundingClientRect();
  const offset = e.clientY - bounding.top;

  indicador.remove();

  if (offset > bounding.height / 2) {
    item.after(indicador);
  } else {
    item.before(indicador);
  }
});

document.addEventListener("dragend", () => {
  if (itemArrastado) {
    if (indicador.parentNode) {
      indicador.replaceWith(itemArrastado);
    }

    itemArrastado.style.opacity = "1";
    itemArrastado = null;
  }
});