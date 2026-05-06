const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.query("SELECT NOW()")
  .then((res) => {
    console.log("✅ Banco conectado:", res.rows[0]);
  })
  .catch((err) => {
    console.error("❌ Erro conexão DB:", err);
  });

module.exports = db;
