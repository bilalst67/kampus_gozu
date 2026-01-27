const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const nodemailer = require('nodemailer');
require("dotenv").config();

// Mail Transport Konfigürasyonu
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,                  
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false 
    }
});

// Kayıt Validasyon Şeması
const registerSchema = Joi.object({
    Ad: Joi.string().trim().min(2).max(50).required(),
    Soyad: Joi.string().trim().min(2).max(50).required(),
    KullaniciAdi: Joi.string().trim().min(3).max(30).required(),
    Email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().max(100).required(),
    Sifre: Joi.string().min(8).max(30).pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*.])")).required()
});

const mapUser = (user) => ({
    KullaniciID: user.KullaniciID,
    Ad: user.Ad,
    Soyad: user.Soyad,
    KullaniciAdi: user.KullaniciAdi,
    Email: user.Email,
    Rol: user.Rol,
});

// === KAYIT İŞLEMİ ===
const createUser = async (req, res, next) => {
    let createdEmail = null;

    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.details[0].message);
        }

        const { Ad, Soyad, KullaniciAdi, Email, Sifre } = req.body;

        // Domain Bazlı Rol Ataması
        const domain = Email.split('@')[1].toLowerCase();
        let userRole = null;

        if (domain === "ogr.uludag.edu.tr") {
            userRole = "Öğrenci";
        } else if (domain === "uludag.edu.tr") {
            userRole = "Akademisyen";
        } else {
            res.status(403);
            throw new Error("Sadece Uludağ Üniversitesi kurumsal e-postaları (@uludag.edu.tr veya @ogr.uludag.edu.tr) ile kayıt olabilirsiniz.");
        }

        const [check] = await pool.query('SELECT * FROM Kullanicilar WHERE Email = ? OR KullaniciAdi = ?', [Email, KullaniciAdi]);
        if (check.length > 0) {
            res.status(400);
            if (check[0].Email === Email) throw new Error("Bu email adresi zaten sistemde kayıtlı.");
            throw new Error("Bu kullanıcı adı alınmış.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(Sifre, salt);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        await pool.query(
            'INSERT INTO Kullanicilar (Ad, Soyad, KullaniciAdi, Email, Sifre, Rol, IsVerified, VerificationToken) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [Ad, Soyad, KullaniciAdi, Email, hashpass, userRole, 0, verificationToken]
        );

        createdEmail = Email;

        try {
            await transporter.sendMail({
                from: '"Kampüs Gözü Güvenlik" <info@kampusgozu.com>',
                to: Email,
                subject: 'Doğrulama Kodunuz - Kampüs Gözü',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h3>Merhaba ${Ad},</h3>
                        <p>Uludağ Üniversitesi hesabınla aramıza hoş geldin.</p>
                        <p>Kaydını tamamlamak için aşağıdaki kodu girmen gerekiyor:</p>
                        <h1 style="color: #d32f2f; letter-spacing: 5px; background-color: #f4f4f4; padding: 10px; display: inline-block;">${verificationToken}</h1>
                        <p><small>Bu işlemi siz yapmadıysanız, bu maili dikkate almayınız.</small></p>
                    </div>
                `
            });
        } catch (mailError) {
            console.error("Mail gönderim hatası:", mailError);
            // Rollback işlemi
            await pool.query('DELETE FROM Kullanicilar WHERE Email = ?', [createdEmail]);
            res.status(500);
            throw new Error("Doğrulama maili gönderilemedi. Kayıt iptal edildi.");
        }

        res.status(201).json({ 
            message: "Kayıt başarılı. Okul e-postanıza doğrulama kodu gönderildi.", 
            email: Email 
        });

    } catch (error) {
        next(error);
    }
};

// === EMAIL DOĞRULAMA ===
const verifyEmail = async (req, res, next) => {
    try {
        const { Email, Code } = req.body;
        const [rows] = await pool.query('SELECT * FROM Kullanicilar WHERE Email = ?', [Email]);
        
        if (rows.length === 0) {
            res.status(404);
            throw new Error("Kullanıcı bulunamadı.");
        }
        
        const user = rows[0];
        if (user.IsVerified === 1) {
            res.status(400);
            throw new Error("Bu hesap zaten doğrulanmış.");
        }

        if (user.VerificationToken !== Code) {
            res.status(400);
            throw new Error("Geçersiz doğrulama kodu!");
        }

        await pool.query('UPDATE Kullanicilar SET IsVerified = 1, VerificationToken = NULL WHERE Email = ?', [Email]);
        
        res.json({ message: "Hesap başarıyla doğrulandı." });
    } catch (error) {
        next(error);
    }
};

// === LOGIN ===
const login = async (req, res, next) => {
    try {
        const { Email, Sifre } = req.body;
        const [rows] = await pool.query('SELECT * FROM Kullanicilar WHERE Email = ?', [Email]);
        
        if (rows.length === 0) {
            res.status(400);
            throw new Error("Kullanıcı bulunamadı.");
        }
        
        const user = rows[0];

        if (user.IsVerified === 0) {
            return res.status(403).json({ 
                message: "Lütfen önce e-posta adresinizi doğrulayın.", 
                notVerified: true, 
                email: user.Email 
            });
        }

        const validPassword = await bcrypt.compare(Sifre, user.Sifre);
        if (!validPassword) {
            res.status(400);
            throw new Error("Hatalı şifre.");
        }

        const token = jwt.sign(
            { id: user.KullaniciID, email: user.Email, role: user.Rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.json({ message: "Giriş Başarılı", token, user: mapUser(user) });
    } catch (error) {
        next(error);
    }
};

// Yardımcı Fonksiyonlar
const getPublicUserList = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT KullaniciID FROM Kullanicilar');
        res.json(rows);
    } catch (err) { next(err); }
}

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM Kullanicilar WHERE KullaniciID = ?', [id]);
        if (rows.length === 0) return res.json([]);
        res.json([mapUser(rows[0])]);
    } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requesterId = req.user.id;
        if (parseInt(id) !== parseInt(requesterId)) {
            res.status(403);
            throw new Error("Sadece kendi profilinizi güncelleyebilirsiniz.");
        }

        const { Ad, Soyad, KullaniciAdi, Email, Sifre } = req.body;

        if (Sifre) {
            const salt = await bcrypt.genSalt(10);
            const hashpass = await bcrypt.hash(Sifre, salt);
            await pool.query(
                'UPDATE Kullanicilar SET Ad=?, Soyad=?, KullaniciAdi=?, Email=?, Sifre=? WHERE KullaniciID=?', 
                [Ad, Soyad, KullaniciAdi, Email, hashpass, id]
            );
        } else {
            await pool.query(
                'UPDATE Kullanicilar SET Ad=?, Soyad=?, KullaniciAdi=?, Email=? WHERE KullaniciID=?', 
                [Ad, Soyad, KullaniciAdi, Email, id]
            );
        }
        
        res.json({ message: "Güncelleme Başarılı." });
    } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requesterId = req.user.id;
        
        if (parseInt(id) !== parseInt(requesterId)) {
            res.status(403);
            throw new Error("Yetkisiz işlem.");
        }
        
        const [result] = await pool.query('DELETE FROM Kullanicilar WHERE KullaniciID = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404);
            throw new Error("Kullanıcı bulunamadı.");
        }
        res.json({ message: "Hesabınız başarıyla silindi." });
    } catch (error) { next(error); }
};

module.exports = { createUser, verifyEmail, login, getUserById, getPublicUserList, updateUser, deleteUser };