const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const mapProblem = (row) => {
    return {
        KullaniciID: row.KullaniciID,
        AdSoyad: `${row.Ad} ${row.Soyad}`, 
        KullaniciAdi: row.KullaniciAdi,
        Email: row.Email,
        Rol: row.Rol,
        SorunID: row.SorunID || null,
        Baslik: row.Baslik || "",
        Aciklama: row.Aciklama || "",
        Latitude: row.Latitude,
        Longitude: row.Longitude,
        KonumMetni: row.KonumMetni,
        FotografUrl: row.FotografUrl,
        Durum: row.Durum,
        Tarih: row.Tarih,
        DestekSayisi: parseInt(row.DestekSayisi || 0),
        Desteklendi: !!row.Desteklendi
    };
};

const userCreateProblem = async (req, res, next) => {
    try {
        const KullaniciID = req.user.id; 
        const { Baslik, Aciklama, Latitude, Longitude, KonumMetni } = req.body;
        const FotografUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!Baslik || !Aciklama || !Latitude || !Longitude) {
            res.status(400);
            throw new Error("Başlık, Açıklama ve Konum alanları zorunludur.");
        }

        const query = `
            INSERT INTO Sorunlar (KullaniciID, Baslik, Aciklama, Latitude, Longitude, KonumMetni, FotografUrl) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await pool.query(query, [KullaniciID, Baslik, Aciklama, parseFloat(Latitude), parseFloat(Longitude), KonumMetni, FotografUrl]);

        res.json({ message: "Sorun başarıyla bildirildi.", sorunId: result.insertId });
    } catch (err) { next(err); }
}

const userreq = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT k.Ad, k.Soyad, k.KullaniciAdi, k.Email, k.Rol, s.* FROM Kullanicilar k
            LEFT JOIN Sorunlar s ON k.KullaniciID = s.KullaniciID
            WHERE k.KullaniciID = ?
            ORDER BY s.Tarih DESC
        `;
        
        const [rows] = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }
        res.json(rows.map(mapProblem));

    } catch (err) { next(err); }
};

const fullProblem = async (req, res, next) => {
    try {
        const currentUserId = req.user ? req.user.id : 0;
        const query = `
            SELECT s.*, k.Ad, k.Soyad, k.KullaniciAdi, k.Rol,
                (SELECT COUNT(*) FROM Destekler d WHERE d.SorunID = s.SorunID) as DestekSayisi,
                (SELECT COUNT(*) FROM Destekler d2 WHERE d2.SorunID = s.SorunID AND d2.KullaniciID = ?) as Desteklendi
            FROM Sorunlar s
            JOIN Kullanicilar k ON s.KullaniciID = k.KullaniciID
            ORDER BY DestekSayisi DESC, s.Tarih DESC
        `;
        const [rows] = await pool.query(query, [currentUserId]);
        res.json(rows.map(mapProblem)); 
    } catch (err) { next(err); }
}

const userDeleteProblem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; 

        // Sorun ve fotoğraf verisini çek
        const [rows] = await pool.query('SELECT KullaniciID, FotografUrl FROM Sorunlar WHERE SorunID = ?', [id]);

        if (rows.length === 0) {
            res.status(404);
            throw new Error("Sorun bulunamadı.");
        }

        const sorun = rows[0];

        // Yetki Kontrolü
        if (parseInt(sorun.KullaniciID) !== parseInt(userId)) {
            res.status(403);
            throw new Error("Bu işlemi yapmaya yetkiniz yok.");
        }

        // Fotoğraf Silme İşlemi
        if (sorun.FotografUrl) {
            const dosyaYolu = path.join(__dirname, '..', sorun.FotografUrl);
            if (fs.existsSync(dosyaYolu)) {
                fs.unlinkSync(dosyaYolu); 
            }
        }

        await pool.query('DELETE FROM Sorunlar WHERE SorunID = ?', [id]);
        
        res.json({ message: "Sorun başarıyla silindi." });

    } catch (err) { next(err); }
}

const deleteProblemAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [findResult] = await pool.query('SELECT KullaniciID, Baslik, FotografUrl FROM Sorunlar WHERE SorunID = ?', [id]);

        if (findResult.length === 0) {
            res.status(404);
            throw new Error("Sorun bulunamadı");
        }

        const { KullaniciID, Baslik, FotografUrl } = findResult[0];

        if (FotografUrl && !FotografUrl.startsWith('http')) {
            const dosyaYolu = path.join(__dirname, '..', FotografUrl);
            if (fs.existsSync(dosyaYolu)) {
                fs.unlinkSync(dosyaYolu);
            }
        }

        // Kullanıcıya bildirim gönder
        const notificationMsg = `"${Baslik}" başlıklı sorununuz reddedildi ve silindi.`;
        await pool.query('INSERT INTO Bildirimler (KullaniciID, Mesaj) VALUES (?, ?)', [KullaniciID, notificationMsg]);

        await pool.query('DELETE FROM Sorunlar WHERE SorunID = ?', [id]);

        res.json({ message: "Sorun silindi ve kullanıcı bilgilendirildi." });
    } catch (err) { next(err); }
};

const updateProblemStatus = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const { Durum } = req.body; 
        if (!Durum) {
            res.status(400);
            throw new Error("Durum bilgisi gerekli.");
        }

        const [result] = await pool.query('UPDATE Sorunlar SET Durum = ? WHERE SorunID = ?', [Durum, id]);
        if (result.affectedRows === 0) {
            res.status(404);
            throw new Error("Sorun bulunamadı.");
        }
        res.json({ message: `Durum güncellendi: ${Durum}` });
    } catch (err) { next(err); }
};

const toggleSupport = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const KullaniciID = req.user.id; 

        const [check] = await pool.query(`SELECT * FROM Destekler WHERE KullaniciID = ? AND SorunID = ?`, [KullaniciID, id]);
        let isLiked = false;

        if (check.length > 0) {
            await pool.query(`DELETE FROM Destekler WHERE KullaniciID = ? AND SorunID = ?`, [KullaniciID, id]);
            isLiked = false;
        } else {
            await pool.query(`INSERT INTO Destekler (KullaniciID, SorunID) VALUES (?, ?)`, [KullaniciID, id]);
            isLiked = true;
        }

        const [count] = await pool.query(`SELECT COUNT(*) as count FROM Destekler WHERE SorunID = ?`, [id]);
        res.json({ success: true, isLiked: isLiked, newCount: parseInt(count[0].count) });

    } catch (err) { next(err); }
};

const getAllProblemsForAdmin = async (req, res, next) => {
    try {
        const query = `
            SELECT s.*, k.Ad, k.Soyad, k.Email,
                (SELECT COUNT(*) FROM Destekler d WHERE d.SorunID = s.SorunID) AS DestekSayisi
            FROM Sorunlar s JOIN Kullanicilar k ON s.KullaniciID = k.KullaniciID
            ORDER BY s.Tarih DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows.map(mapProblem));
    } catch (err) { next(err); }
};

const getPublicProblems = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`SELECT SorunID, Baslik, Aciklama, Latitude, Longitude, KonumMetni, Durum, FotografUrl FROM Sorunlar ORDER BY Tarih DESC`);
        res.json(rows);
    } catch (err) { next(err); }
}

const getUserNotifications = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.query('SELECT * FROM Bildirimler WHERE KullaniciID = ? AND Okundu = 0 ORDER BY Tarih DESC', [userId]);
        
        if (rows.length > 0) {
            await pool.query('UPDATE Bildirimler SET Okundu = 1 WHERE KullaniciID = ?', [userId]);
        }
        res.json(rows);
    } catch (err) { next(err); }
};

module.exports = { 
    fullProblem,
    userCreateProblem,
    userDeleteProblem,
    userreq,
    toggleSupport,
    getPublicProblems,
    getAllProblemsForAdmin,
    updateProblemStatus,
    deleteProblemAdmin,
    getUserNotifications
};