// ── PROTEÇÃO DE ROTA ────────────────────────────────────
// Se estiver no index.html e não tiver token, redireciona pro login
(function verificarAutenticacao() {
  var naLogin = window.location.pathname.includes("login.html");
  var token = localStorage.getItem("token");

  if (!naLogin && !token) {
    window.location.href = "/pages/login.html";
    return;
  }

  // Se já está logado e tentou acessar o login, vai pro index
  if (naLogin && token) {
    window.location.href = "/index.html";
  }
})();

// ── VALIDAÇÃO DE CAMPOS ──────────────────────────────────
function validarCamposLogin() {
  var email = document.getElementById("email");
  var senha = document.getElementById("senha");

  if (!email || !senha) return true; // não está na página de login

  if (!email.value.trim() || !senha.value.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Campos obrigatórios",
      text: "Preencha e-mail e senha para continuar.",
    });
    return false;
  }
  return true;
}

// ── LOGIN ────────────────────────────────────────────────
async function login() {
  if (!validarCamposLogin()) return;

  var email = document.getElementById("email").value.trim();
  var senha = document.getElementById("senha").value.trim();

  var btn = document.getElementById("btnLogin");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Entrando...";
  }

  try {
    var resposta = await fetch(API_URL + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, senha: senha }),
    });

    var data = await resposta.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("logado", "true");
      localStorage.setItem("emailUsuario", email);
      window.location.href = "/index.html";
    } else {
      Swal.fire({
        icon: "error",
        title: "Acesso negado",
        text: data.message || "E-mail ou senha inválidos.",
      });
    }
  } catch (err) {
    console.error("Erro no login:", err);
    Swal.fire({
      icon: "error",
      title: "Erro de conexão",
      text: "Não foi possível conectar ao servidor.",
    });
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Entrar";
    }
  }
}

// ── LOGOUT ───────────────────────────────────────────────
async function logout() {
  var resultado = await Swal.fire({
    title: "Tem certeza?",
    text: "Deseja sair do sistema?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, sair",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  });

  if (resultado.isConfirmed) {
    localStorage.removeItem("token");
    localStorage.removeItem("logado");
    localStorage.removeItem("emailUsuario");
    window.location.href = "/pages/login.html";
  }
}

// ── ENTER para submeter ──────────────────────────────────
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    var senhaEl = document.getElementById("senha");
    if (senhaEl && document.activeElement === senhaEl) {
      login();
    }
  }
});
