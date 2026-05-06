const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth.js");
const db = require("../config/dataBase.js");
const upload = require("../middleware/multer");
const cloudinary = require("../middleware/upload");
const { PassThrough } = require("stream");

// =============================
// 📦 LISTAR PRODUTOS
// =============================
router.get("/produtos", verificarToken, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM produtos");

    res.json(result.rows || []);
  } catch (err) {
    console.error("Erro listar produtos:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// ➕ ADICIONAR PRODUTO
// =============================
router.post(
  "/produtos",
  verificarToken,
  upload.single("imagemProduto"),
  async (req, res) => {
    try {
      const { nome, codigo, marca, quantidade, preco_custo, preco_venda } =
        req.body;

      let imagemProduto = null;

      // upload Cloudinary
      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "produtos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );

          const bufferStream = new PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(stream);
        });

        imagemProduto = result.secure_url;
      }

      await db.query(
        `INSERT INTO produtos
        (nome, codigo, marca, quantidade, preco_custo, preco_venda, imagemproduto)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          nome,
          codigo,
          marca,
          quantidade,
          preco_custo,
          preco_venda,
          imagemProduto,
        ],
      );

      res.json({ message: "Produto cadastrado!" });
    } catch (err) {
      console.error("Erro criar produto:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// =============================
// ✏️ EDITAR PRODUTO
// =============================
router.put(
  "/produtos/:id",
  verificarToken,
  upload.single("imagemProduto"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const { nome, codigo, marca, quantidade, preco_custo, preco_venda } =
        req.body;

      let imagemProduto = null;

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "produtos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );

          const bufferStream = new PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(stream);
        });

        imagemProduto = result.secure_url;
      }

      let query = `
        UPDATE produtos
        SET nome = $1,
            codigo = $2,
            marca = $3,
            quantidade = $4,
            preco_custo = $5,
            preco_venda = $6
      `;

      const params = [
        nome,
        codigo,
        marca,
        quantidade,
        preco_custo,
        preco_venda,
      ];

      if (imagemProduto) {
        query += `, imagemproduto = $7 WHERE id = $8`;
        params.push(imagemProduto, id);
      } else {
        query += ` WHERE id = $7`;
        params.push(id);
      }

      await db.query(query, params);

      res.json({ message: "Produto atualizado!" });
    } catch (err) {
      console.error("Erro atualizar produto:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// =============================
// 🗑️ REMOVER PRODUTO
// =============================
router.delete("/produtos/:id", verificarToken, async (req, res) => {
  try {
    await db.query("DELETE FROM produtos WHERE id = $1", [req.params.id]);

    res.json({ message: "Produto removido!" });
  } catch (err) {
    console.error("Erro remover produto:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
