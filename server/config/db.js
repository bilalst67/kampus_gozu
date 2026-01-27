const mysql = require('mysql2/promise');
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
});

// Bağlantı testi
pool.getConnection()
    .then(connection => {
        console.log("✅ MySQL Veritabanı bağlantısı başarılı.");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Veritabanı bağlantı hatası:", err.message);
    });

module.exports = { pool };