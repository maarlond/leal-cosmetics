// ══════════════════════════════════════════════════════
// PROTEÇÃO DE ROTA — roda imediatamente ao carregar
// ══════════════════════════════════════════════════════
(function protegerRota() {
  var naLogin = window.location.pathname.includes("login.html");
  var token = localStorage.getItem("token");

  // Sem token fora do login → redireciona
  if (!naLogin && !token) {
    window.location.replace("/pages/login.html");
    return;
  }

  // Já logado tentando acessar login → vai pro index
  if (naLogin && token) {
    window.location.replace("/index.html");
  }
})();

// ══════════════════════════════════════════════════════
// VALIDAÇÃO DE E-MAIL
// ══════════════════════════════════════════════════════
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ══════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════
async function login() {
  var emailEl = document.getElementById("email");
  var senhaEl = document.getElementById("senha");
  var btnEl = document.getElementById("btnLogin");

  if (!emailEl || !senhaEl) return; // não está na página de login

  var email = emailEl.value.trim();
  var senha = senhaEl.value.trim();

  // ── Validações ──
  if (!email) {
    emailEl.classList.add("is-invalid");
    emailEl.focus();
    Swal.fire({
      icon: "warning",
      title: "Campo obrigatório",
      text: "Digite seu e-mail.",
      confirmButtonColor: "#b56df5",
    });
    return;
  }

  if (!emailValido(email)) {
    emailEl.classList.add("is-invalid");
    emailEl.focus();
    Swal.fire({
      icon: "warning",
      title: "E-mail inválido",
      text: "Digite um e-mail válido. Ex: usuario@email.com",
      confirmButtonColor: "#b56df5",
    });
    return;
  }

  if (!senha) {
    senhaEl.classList.add("is-invalid");
    senhaEl.focus();
    Swal.fire({
      icon: "warning",
      title: "Campo obrigatório",
      text: "Digite sua senha.",
      confirmButtonColor: "#b56df5",
    });
    return;
  }

  if (senha.length < 4) {
    senhaEl.classList.add("is-invalid");
    Swal.fire({
      icon: "warning",
      title: "Senha muito curta",
      text: "A senha deve ter pelo menos 4 caracteres.",
      confirmButtonColor: "#b56df5",
    });
    return;
  }

  // Remove classes de erro ao digitar
  emailEl.classList.remove("is-invalid");
  senhaEl.classList.remove("is-invalid");

  // ── Loading no botão ──
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';
  }

  try {
    var res = await fetch(API_URL + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, senha: senha }),
    });

    var data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("logado", "true");
      localStorage.setItem("emailUsuario", email);

      // Feedback visual antes de redirecionar
      Swal.fire({
        icon: "success",
        title: "Bem-vinda! 💜",
        text: "Redirecionando...",
        timer: 1200,
        showConfirmButton: false,
        confirmButtonColor: "#b56df5",
      }).then(function () {
        window.location.replace("/index.html");
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Acesso negado",
        text: data.erro || "E-mail ou senha incorretos.",
        confirmButtonColor: "#b56df5",
      });
      emailEl.classList.add("is-invalid");
      senhaEl.classList.add("is-invalid");
    }
  } catch (err) {
    console.error("Erro no login:", err);
    Swal.fire({
      icon: "error",
      title: "Erro de conexão",
      text: "Não foi possível conectar ao servidor. Tente novamente.",
      confirmButtonColor: "#b56df5",
    });
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = "Entrar";
    }
  }
}

// ══════════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════════
async function logout() {
  var resultado = await Swal.fire({
    title: "Tem certeza?",
    text: "Deseja sair do sistema?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, sair",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#b56df5",
  });

  if (resultado.isConfirmed) {
    localStorage.removeItem("token");
    localStorage.removeItem("logado");
    localStorage.removeItem("emailUsuario");
    window.location.replace("/pages/login.html");
  }
}

// ══════════════════════════════════════════════════════
// TOGGLE SENHA
// ══════════════════════════════════════════════════════
function toggleSenha() {
  var input = document.getElementById("senha");
  var icon = document.querySelector(".toggle-senha i");
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  } else {
    input.type = "password";
    if (icon) {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }
}

// ══════════════════════════════════════════════════════
// ENTER para logar
// ══════════════════════════════════════════════════════
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    var na = window.location.pathname.includes("login.html");
    if (na) login();
  }
});

// ══════════════════════════════════════════════════════
// LIMPA is-invalid ao digitar
// ══════════════════════════════════════════════════════
document.addEventListener("input", function (e) {
  if (e.target && e.target.classList.contains("is-invalid")) {
    e.target.classList.remove("is-invalid");
  }
});
