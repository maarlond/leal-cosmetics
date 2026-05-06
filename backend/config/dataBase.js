const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect()
  .then(() => console.log("✅ Banco Supabase conectado"))
  .catch((err) => console.error("Erro conexão DB:", err));

module.exports = db;
