// Pega os elementos do formulário
//const btnCadastrar = document.getElementById("btnCadastrar");

//const API_URL = "https://estoque-namorada.onrender.com";

// ===============================
// Funções de validação
// ===============================

function validarCampos() {
  let valido = true;

  const nome = document.getElementById("nome");
  //const codigo = document.getElementById("codigo");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmaSenha = document.getElementById("confirmaSenha");

  const campos = [nome, email, senha, confirmaSenha];

  // remove erro antigo
  /*campos.forEach((c) => c.classList.remove("campo-erro"));

  if (!nome.value.trim()) {
    nome.classList.add("campo-erro");
    valido = false;
  }

  if (!email.value.trim()) {
    email.classList.add("campo-erro");
    valido = false;
  }

  if (!senha.value) {
    senha.classList.add("campo-erro");
    valido = false;
  }

  if (!confirmaSenha.value) {
    confirmaSenha.classList.add("campo-erro");
    valido = false;
  }
*/

  if (!valido) {
    Swal.fire({
      icon: "warning",
      title: "Preencha os campos obrigatórios",
      text: "Os campos em vermelho precisam ser corrigidos.",
    });

    return false;
  }

  return true;
}

// Valida email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Valida senha (mínimo 6 caracteres, pelo menos uma letra e um número)
function validarSenha(senha) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return regex.test(senha);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      cadastrarUsuario();
    });
  }
});

async function cadastrarUsuario() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const confirmaSenha = document.getElementById("confirmaSenha").value.trim();

  // validação de campos
  if (!nome || !email || !senha || !confirmaSenha) {
    return Swal.fire({
      icon: "warning",
      title: "Campos obrigatórios",
      text: "Preencha todos os campos.",
    });
  }

  // validar email
  if (!validarEmail(email)) {
    return Swal.fire({
      icon: "error",
      title: "Email inválido",
      text: "Digite um email válido.",
    });
  }

  // validar senha
  if (!validarSenha(senha)) {
    return Swal.fire({
      icon: "error",
      title: "Senha fraca",
      text: "A senha precisa ter pelo menos 6 caracteres com letras e números.",
    });
  }

  // confirmar senha
  if (senha !== confirmaSenha) {
    return Swal.fire({
      icon: "error",
      title: "Senhas não conferem",
      text: "Digite a mesma senha nos dois campos.",
    });
  }

  try {
    Swal.fire({
      title: "Cadastrando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const resposta = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
      }),
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      throw new Error(data.mensagem || "Erro ao cadastrar usuário");
    }

    await Swal.fire({
      icon: "success",
      title: "Cadastro realizado!",
      text: "Redirecionando para o login...",
      timer: 2000,
      showConfirmButton: false,
    });

    // redireciona
    window.location.href = "../pages/login.html";
  } catch (erro) {
    console.error("Erro:", erro);

    Swal.fire({
      icon: "error",
      title: "Erro",
      text: erro.message || "Erro ao conectar com o servidor.",
    });
  }
}
