// ══════════════════════════════════════════════════════
// CONTROLE DE NAVEGAÇÃO — sem lag entre telas
// ══════════════════════════════════════════════════════
var _carregando = false; // trava para evitar cliques duplos

function carregarPagina(pagina, elemento) {
  // Evita carregar a mesma página duas vezes ou enquanto já carrega
  if (_carregando) return;
  var paginaAtiva = localStorage.getItem("paginaAtual");
  if (
    pagina === paginaAtiva &&
    document.getElementById("conteudoPrincipal").innerHTML.trim() !== ""
  ) {
    // só atualiza o active do menu
    atualizarMenuAtivo(elemento);
    return;
  }

  _carregando = true;
  var conteudo = document.getElementById("conteudoPrincipal");

  // Fade out
  conteudo.style.opacity = "0";
  conteudo.style.transition = "opacity .15s ease";

  setTimeout(function () {
    // Destrói DataTable se existir para evitar erro de re-init
    if ($.fn.DataTable.isDataTable("#tabelaProdutos")) {
      $("#tabelaProdutos").DataTable().destroy();
    }
    if ($.fn.DataTable.isDataTable("#tabelaRelatorio")) {
      $("#tabelaRelatorio").DataTable().destroy();
    }

    $("#conteudoPrincipal").load(pagina, function (response, status) {
      if (status === "error") {
        conteudo.innerHTML =
          '<div style="padding:40px;text-align:center;color:#aaa">Não foi possível carregar a página.</div>';
        _carregando = false;
        conteudo.style.opacity = "1";
        return;
      }

      atualizarMenuAtivo(elemento);
      localStorage.setItem("paginaAtual", pagina);

      // Inicializa o script da página carregada
      if (pagina.includes("produtos")) {
        if (typeof iniciarTabelaProdutos === "function")
          iniciarTabelaProdutos();
      }
      if (pagina.includes("dashboard")) {
        if (typeof iniciarDashboard === "function") iniciarDashboard();
      }
      if (pagina.includes("vendas")) {
        if (typeof iniciarVendas === "function") iniciarVendas();
      }
      if (pagina.includes("relatorios")) {
        if (typeof iniciarRelatorios === "function") iniciarRelatorios();
      }

      // Fade in
      conteudo.style.opacity = "1";
      _carregando = false;
    });
  }, 150);
}

function atualizarMenuAtivo(elemento) {
  document.querySelectorAll(".menu-item").forEach(function (link) {
    link.classList.remove("active");
  });
  if (elemento) elemento.classList.add("active");
}

// ══════════════════════════════════════════════════════
// INIT — carrega última página ou dashboard
// ══════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", function () {
  var paginaSalva =
    localStorage.getItem("paginaAtual") || "pages/dashboard.html";

  // Valida se a página salva é uma das páginas válidas
  var paginasValidas = [
    "pages/dashboard.html",
    "pages/produtos.html",
    "pages/vendas.html",
    "pages/relatorios.html",
  ];
  if (!paginasValidas.includes(paginaSalva)) {
    paginaSalva = "pages/dashboard.html";
  }

  var menu = document.querySelector('[data-pagina="' + paginaSalva + '"]');
  carregarPagina(paginaSalva, menu);
});
