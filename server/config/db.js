const { Pool } = require('pg');
require("dotenv").config();

// PostgreSQL Havuz Bağlantısı
const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
pool.on('error', (err, client) => {
    console.error('⚠️ Beklenmedik veritabanı hatası (Client Error):', err.message);
});

// --- Bağlantı Testi ---
pool.connect()
    .then(client => {
        console.log("✅ PostgreSQL Veritabanına Başarıyla Bağlandı!");
        client.release();
    })
    .catch(err => {
        console.error("❌ Veritabanı Bağlantı Hatası:", err.message);
    });

module.exports = { pool };
