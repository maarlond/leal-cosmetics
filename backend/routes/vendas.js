const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth");
const db = require("../config/dataBase.js");

// =============================
// 💰 CRIAR VENDA
// =============================
router.post("/vendas", verificarToken, async (req, res) => {
  const { cliente, forma_pagamento, observacao, total, data_venda, itens } =
    req.body;

  try {
    // 1. inserir venda (POSTGRES usa RETURNING)
    const vendaResult = await db.query(
      `INSERT INTO vendas (cliente, forma_pagamento, observacao, total, data_venda)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [cliente, forma_pagamento, observacao, total, data_venda],
    );

    const vendaId = vendaResult.rows[0].id;

    // 2. itens + atualização estoque
    if (Array.isArray(itens)) {
      for (const item of itens) {
        await db.query(
          `INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco_unitario)
           VALUES ($1, $2, $3, $4)`,
          [vendaId, item.produto_id, item.quantidade, item.preco_unitario],
        );

        await db.query(
          `UPDATE produtos
           SET quantidade = quantidade - $1
           WHERE id = $2`,
          [item.quantidade, item.produto_id],
        );
      }
    }

    res.json({ message: "Venda salva com sucesso", vendaId });
  } catch (err) {
    console.error("Erro criar venda:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 📊 ÚLTIMOS 7 DIAS
// =============================
router.get("/vendas/ultimos7dias", verificarToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        DATE(data_venda) as data,
        COALESCE(SUM(total),0) as total
      FROM vendas
      WHERE data_venda >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(data_venda)
      ORDER BY data ASC
    `);

    res.json(result.rows || []);
  } catch (err) {
    console.error("Erro ultimos7dias:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 💳 PAGAMENTOS
// =============================
router.get("/vendas/pagamentos", verificarToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        forma_pagamento,
        COALESCE(SUM(total),0) as total
      FROM vendas
      GROUP BY forma_pagamento
    `);

    res.json(result.rows || []);
  } catch (err) {
    console.error("Erro pagamentos:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 📈 RESUMO HOJE / MÊS
// =============================
router.get("/vendas/resumo", verificarToken, async (req, res) => {
  try {
    const hojeResult = await db.query(`
      SELECT COALESCE(SUM(total),0) as total
      FROM vendas
      WHERE DATE(data_venda) = CURRENT_DATE
    `);

    const mesResult = await db.query(`
      SELECT COALESCE(SUM(total),0) as total
      FROM vendas
      WHERE EXTRACT(MONTH FROM data_venda) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM data_venda) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    res.json({
      hoje: hojeResult.rows[0].total,
      mes: mesResult.rows[0].total,
    });
  } catch (err) {
    console.error("Erro resumo:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 📦 ÚLTIMAS VENDAS
// =============================
router.get("/vendas/ultimasVendas", verificarToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await db.query(
      `SELECT * FROM vendas
       ORDER BY data_venda DESC
       LIMIT $1`,
      [limit],
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error("Erro ultimasVendas:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
