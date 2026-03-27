// middleware/multer.js
const multer = require("multer");

// armazenamento em memória para enviar direto para Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
