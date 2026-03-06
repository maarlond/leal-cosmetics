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

router.post("/login", (req, res) => {

    const { email, senha } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        // verifica se usuário existe
        if (result.length === 0) {
            return res.status(401).json({ erro: "Usuário não encontrado" });
        }

        const usuario = result[0];

        // comparar senha digitada com hash
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha inválida" });
        }

        // gerar token JWT
        const token = jwt.sign(
            { id: usuario.id },
            SECRET,
            { expiresIn: "8h" }
        );

        res.json({ token });

    });

});


// exportar rotas
module.exports = router;