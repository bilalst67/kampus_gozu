const { Pool } = require('pg');
require("dotenv").config();

// PostgreSQL Havuz Bağlantısı
const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false // Neon.tech (Bulut) için gerekli
    }
});

pool.connect()
    .then(() => console.log("✅ PostgreSQL Veritabanına Başarıyla Bağlandı!"))
    .catch(err => {
        console.error("❌ Veritabanı Hatası:", err);
        process.exit(1); // Bağlanamazsa sunucuyu durdur
    });

module.exports = { pool };
