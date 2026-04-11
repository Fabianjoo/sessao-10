const btnAbrirItens = document.getElementById("btnPopoverItens");
const popoverItens = document.querySelector(".itensManuaisPopover");
const contentItens = document.querySelector("#itensManuais");

btnAbrirItens.addEventListener("click", () => {
  popoverItens.style.display = "flex";
});

popoverItens.addEventListener("click", (e) => {
    if (!contentItens.contains(e.target)) {
      popoverItens.style.display = "none";
    }
  });