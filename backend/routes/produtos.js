const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth.js");
const db = require("../config/dataBase.js"); // importe seu db aqui, se necessário

// Listar produtos
router.get("/produtos", verificarToken, (req, res) => {
    db.query("SELECT * FROM produtos", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Adicionar produto
router.post("/produtos", verificarToken, (req, res) => {
    const { nome, codigo, marca, quantidade, preco_custo, preco_venda } = req.body;

    db.query(
        "INSERT INTO produtos (nome, codigo, marca, quantidade, preco_custo, preco_venda) VALUES (?, ?, ?, ?, ?, ?)",
        [nome, codigo, marca, quantidade, preco_custo, preco_venda],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Produto cadastrado!" });
        }
    );
});

// Editar produto
router.put("/produtos/:id", (req, res) => {
    const id = req.params.id;
    const { nome, codigo, marca, quantidade, preco_custo, preco_venda } = req.body;

    db.query(
        `UPDATE produtos
         SET nome=?, codigo=?, marca=?, quantidade=?, preco_custo=?, preco_venda=?
         WHERE id=?`,
        [nome, codigo, marca, quantidade, preco_custo, preco_venda, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Produto atualizado!" });
        }
    );
});

// Remover produto
router.delete("/produtos/:id", (req, res) => {
    db.query("DELETE FROM produtos WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Produto removido!" });
    });
});

module.exports = router;