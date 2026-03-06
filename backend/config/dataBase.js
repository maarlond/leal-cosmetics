const mysql = require("mysql2");

const db = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "123456",
    database: "estoque_db"

});

db.connect(err => {

    if (err) {
        console.error("Erro ao conectar:", err);
        return;
    }

    console.log("Banco conectado!");

});

module.exports = db;