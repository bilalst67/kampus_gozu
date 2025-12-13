// api/db.js
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Bu fonksiyonu diğer dosyalarda kullanacağız
async function executeQuery(query, params = []) {
    try {
        let pool = await sql.connect(config);
        let request = pool.request();

        // Parametreleri güvenli ekle (SQL Injection önlemi)
        params.forEach(p => {
            request.input(p.name, p.type, p.value);
        });

        let result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('SQL Hatası:', err);
        throw err;
    }
}
/* Yukardaki fonksiyondaki paramsı böyle tanımlicaksın.
const parametreler = [
    { 
        name: 'AdParametresi',  // SQL'deki @AdParametresi ile eşleşir
        type: sql.NVarChar,     // Tipi String (Metin) olsun dedik
        value: 'Bilal'          // Gerçek değer
    },
    { 
        name: 'SoyadParametresi', 
        type: sql.NVarChar, 
        value: 'Sarıtaş' 
    }
];
*/

module.exports = executeQuery;