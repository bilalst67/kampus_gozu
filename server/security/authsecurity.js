const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require("dotenv").config();

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    
    // Token formatı kontrolü (Bearer şeması)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Erişim reddedildi. Token bulunamadı." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Token Validasyonu
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Veritabanı kontrolü (Kullanıcı silinmiş veya pasif durumda mı?)
        const [rows] = await pool.query(
            'SELECT KullaniciID, Email, Rol, IsVerified FROM Kullanicilar WHERE KullaniciID = ?', 
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Kullanıcı bulunamadı veya silinmiş. Lütfen tekrar giriş yapın." });
        }

        const user = rows[0];

        // Doğrulama kontrolü
        if (user.IsVerified === 0) {
             return res.status(403).json({ message: "Hesabınız doğrulanmamış." });
        }

        // Güncel kullanıcı bilgisini request nesnesine ekle
        req.user = {
            id: user.KullaniciID,
            email: user.Email,
            role: user.Rol
        };

        next();
    } catch (err) {
        console.error("Auth Hatası:", err.message);
        return res.status(401).json({ message: "Geçersiz veya süresi dolmuş oturum." });
    }
};

module.exports = verifyToken;