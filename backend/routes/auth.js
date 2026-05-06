// ===============================
// IMPORTAÇÃO DAS BIBLIOTECAS
// ===============================
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// conexão com banco
const db = require("../config/dataBase.js");

// chave secreta do JWT
const SECRET = "segredo_super";

// ===============================
// ROTA DE LOGIN
// ===============================

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const sql = "SELECT * FROM usuarios WHERE email = $1";
    const result = await db.query(sql, [email]);

    // verifica se usuário existe
    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const usuario = result.rows[0];

    // comparar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida" });
    }

    // JWT
    const token = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: "8h" });

    res.json({ token });
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/usuarios", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const verifica = await db.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (verifica.rows.length > 0) {
      return res.status(400).json({ mensagem: "E-mail já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)",
      [nome, email, senhaHash],
    );

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso" });
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro no banco" });
  }
});

router.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({
      ok: true,
      time: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

// exportar rotas
module.exports = router;
