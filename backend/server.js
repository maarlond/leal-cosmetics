const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");


const app = express();
app.use(cors());
app.use(express.json());

// SERVIR FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "estoque_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("Banco conectado!");
});

// Listar produtos
app.get("/produtos", (req, res) => {
    db.query("SELECT * FROM produtos", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Adicionar produto
app.post("/produtos", (req, res) => {
    const { nome, codigo, marca, quantidade, preco_custo, preco_venda } = req.body;

    db.query(
        "INSERT INTO produtos (nome, codigo, marca, quantidade, preco_custo, preco_venda) VALUES (?, ?,?, ?, ?, ?)",
        [nome, codigo, marca, quantidade, preco_custo, preco_venda],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Produto cadastrado!" });
        }
    );
});

// Editar produto
app.put("/produtos/:id", (req, res) => {

    const id = req.params.id;
    const { nome, codigo, marca, quantidade, preco_custo, preco_venda } = req.body;

    db.query(`
        UPDATE produtos
        SET nome=?, codigo=?, marca=?, quantidade=?, preco_custo=?, preco_venda=?
        WHERE id=?
    `,
        [nome, codigo, marca, quantidade, preco_custo, preco_venda, id],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            console.log("Atualizado:", result);

            res.json({ message: "Produto atualizado!" });

        });

});

// Remover produto
app.delete("/produtos/:id", (req, res) => {
    db.query(
        "DELETE FROM produtos WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Produto removido!" });
        }
    );
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});