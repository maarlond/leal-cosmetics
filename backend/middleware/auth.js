// ══════════════════════════════════════════════════════
// IMPORTAÇÕES
// ══════════════════════════════════════════════════════
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // nativo do Node — sem instalar
const nodemailer = require("nodemailer");
const db = require("../config/dataBase.js");

const SECRET = process.env.JWT_SECRET || "segredo_super";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// ══════════════════════════════════════════════════════
// CONFIGURAÇÃO DO NODEMAILER (Gmail)
// ══════════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // seu gmail no .env
    pass: process.env.EMAIL_PASS, // senha de app do Google no .env
  },
});

// ══════════════════════════════════════════════════════
// FUNÇÃO: enviar e-mail de verificação
// ══════════════════════════════════════════════════════
async function enviarEmailVerificacao(email, nome, token) {
  const link = `${BASE_URL}/auth/verificar/${token}`;

  await transporter.sendMail({
    from: `"Leal Cosméticos 💜" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Confirme seu e-mail — Leal Cosméticos",
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin:0;padding:0;background:#f5f3f0;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
          <tr><td align="center">
            <table width="100%" style="max-width:520px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

              <!-- HEADER -->
              <tr>
                <td style="background:linear-gradient(135deg,#2d1220,#c4517a);padding:36px 40px;text-align:center;">
                  <div style="font-size:2rem;margin-bottom:8px;">💜</div>
                  <h1 style="color:#fff;font-size:1.4rem;margin:0;font-weight:700;">Leal Cosméticos</h1>
                  <p style="color:rgba(255,255,255,.65);font-size:.85rem;margin:6px 0 0;">Confirme seu endereço de e-mail</p>
                </td>
              </tr>

              <!-- CORPO -->
              <tr>
                <td style="padding:36px 40px;">
                  <p style="color:#555;font-size:.95rem;line-height:1.7;margin:0 0 20px;">
                    Olá${nome ? ", <strong>" + nome + "</strong>" : ""}! 👋<br/>
                    Recebemos seu cadastro no sistema. Para ativar sua conta, clique no botão abaixo:
                  </p>

                  <div style="text-align:center;margin:28px 0;">
                    <a href="${link}"
                       style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#c4517a,#8b3457);color:#fff;text-decoration:none;border-radius:12px;font-size:.97rem;font-weight:700;letter-spacing:.02em;">
                      ✅ Confirmar meu e-mail
                    </a>
                  </div>

                  <p style="color:#aaa;font-size:.8rem;line-height:1.6;margin:0;">
                    Este link expira em <strong>24 horas</strong>.<br/>
                    Se você não solicitou este cadastro, ignore este e-mail.
                  </p>
                </td>
              </tr>

              <!-- LINK ALTERNATIVO -->
              <tr>
                <td style="padding:0 40px 28px;">
                  <p style="color:#bbb;font-size:.75rem;word-break:break-all;margin:0;">
                    Ou copie: <span style="color:#c4517a;">${link}</span>
                  </p>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background:#faf7f4;padding:20px 40px;text-align:center;border-top:1px solid #eddde6;">
                  <p style="color:#ccc;font-size:.75rem;margin:0;">© 2025 Leal Cosméticos · Feito com 💜</p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
}

// ══════════════════════════════════════════════════════
// ROTA: LOGIN
// ══════════════════════════════════════════════════════
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
  }

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ erro: "Erro no servidor." });

      if (result.length === 0) {
        return res.status(401).json({ erro: "E-mail ou senha incorretos." });
      }

      const usuario = result[0];

      // Verifica se o e-mail foi confirmado
      if (!usuario.email_verificado) {
        return res.status(403).json({
          erro: "E-mail não verificado.",
          naoVerificado: true,
          mensagem:
            "Confirme seu e-mail antes de acessar. Verifique sua caixa de entrada.",
        });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: "E-mail ou senha incorretos." });
      }

      const token = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: "8h" });
      res.json({ token });
    },
  );
});

// ══════════════════════════════════════════════════════
// ROTA: CADASTRO
// ══════════════════════════════════════════════════════
router.post("/usuarios", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "E-mail e senha são obrigatórios." });
  }

  // Validação de formato no backend também
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ mensagem: "Formato de e-mail inválido." });
  }

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, result) => {
      if (err)
        return res.status(500).json({ mensagem: "Erro no banco de dados." });
      if (result.length > 0)
        return res.status(400).json({ mensagem: "E-mail já cadastrado." });

      try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const tokenVerif = crypto.randomBytes(32).toString("hex");
        const expiracao = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        db.query(
          `INSERT INTO usuarios (nome, email, senha, email_verificado, token_verificacao, token_expiracao)
         VALUES (?, ?, ?, 0, ?, ?)`,
          [nome || "", email, senhaHash, tokenVerif, expiracao],
          async (err2) => {
            if (err2)
              return res
                .status(500)
                .json({ mensagem: "Erro ao cadastrar usuário." });

            try {
              await enviarEmailVerificacao(email, nome, tokenVerif);
              res.status(201).json({
                mensagem:
                  "Cadastro realizado! Verifique seu e-mail para ativar a conta.",
              });
            } catch (emailErr) {
              console.error("Erro ao enviar e-mail:", emailErr);
              res.status(201).json({
                mensagem:
                  "Cadastro realizado, mas falha ao enviar e-mail. Contate o administrador.",
              });
            }
          },
        );
      } catch (e) {
        res.status(500).json({ mensagem: "Erro interno." });
      }
    },
  );
});

// ══════════════════════════════════════════════════════
// ROTA: VERIFICAR E-MAIL (link do e-mail)
// ══════════════════════════════════════════════════════
router.get("/verificar/:token", (req, res) => {
  const { token } = req.params;

  db.query(
    "SELECT * FROM usuarios WHERE token_verificacao = ?",
    [token],
    (err, result) => {
      if (err || result.length === 0) {
        return res.redirect("/pages/verificar.html?status=invalido");
      }

      const usuario = result[0];

      // Verifica se já foi confirmado
      if (usuario.email_verificado) {
        return res.redirect("/pages/verificar.html?status=jaVerificado");
      }

      // Verifica expiração
      if (new Date() > new Date(usuario.token_expiracao)) {
        return res.redirect("/pages/verificar.html?status=expirado");
      }

      // Ativa a conta
      db.query(
        "UPDATE usuarios SET email_verificado = 1, token_verificacao = NULL, token_expiracao = NULL WHERE id = ?",
        [usuario.id],
        (err2) => {
          if (err2) return res.redirect("/pages/verificar.html?status=erro");
          res.redirect("/pages/verificar.html?status=sucesso");
        },
      );
    },
  );
});

// ══════════════════════════════════════════════════════
// ROTA: REENVIAR E-MAIL DE VERIFICAÇÃO
// ══════════════════════════════════════════════════════
router.post("/reenviar-verificacao", (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ erro: "E-mail obrigatório." });

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, result) => {
      if (err || result.length === 0) {
        // Responde OK mesmo sem encontrar (segurança — não revela se existe)
        return res.json({
          mensagem:
            "Se o e-mail estiver cadastrado, você receberá um novo link.",
        });
      }

      const usuario = result[0];

      if (usuario.email_verificado) {
        return res.json({
          mensagem: "Este e-mail já foi verificado. Faça login normalmente.",
        });
      }

      const novoToken = crypto.randomBytes(32).toString("hex");
      const expiracao = new Date(Date.now() + 24 * 60 * 60 * 1000);

      db.query(
        "UPDATE usuarios SET token_verificacao = ?, token_expiracao = ? WHERE id = ?",
        [novoToken, expiracao, usuario.id],
        async (err2) => {
          if (err2)
            return res.status(500).json({ erro: "Erro ao gerar novo token." });
          try {
            await enviarEmailVerificacao(
              usuario.email,
              usuario.nome,
              novoToken,
            );
            res.json({
              mensagem: "Novo link enviado! Verifique sua caixa de entrada.",
            });
          } catch (e) {
            res.status(500).json({ erro: "Erro ao enviar e-mail." });
          }
        },
      );
    },
  );
});

module.exports = router;
