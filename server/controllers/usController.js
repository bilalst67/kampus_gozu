const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
require("dotenv").config();

// --- VALIDASYON ŞEMASI ---
const registerSchema = Joi.object({
    // AD SOYAD: Boşlukları temizle, min 3, max 50 karakter
    AdSoyad: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.base": "Ad Soyad metin formatında olmalıdır",
            "string.empty": "Ad Soyad alanı boş bırakılamaz",
            "string.min": "Ad Soyad en az 3 karakter olmalıdır",
            "string.max": "Ad Soyad en fazla 50 karakter olabilir",
            "any.required": "Ad Soyad alanı zorunludur"
        }),

    // EMAIL: Geçerli e-posta formatı, lowercase yap, max 100 karakter
    Email: Joi.string()
        .email({ tlds: { allow: false } })
        .trim()
        .lowercase()
        .max(100)
        .required()
        .messages({
            "string.email": "Lütfen geçerli bir e-posta adresi giriniz",
            "string.empty": "E-posta alanı boş bırakılamaz",
            "any.required": "E-posta alanı zorunludur"
        }),

    // ŞİFRE: En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter
    Sifre: Joi.string()
        .min(8)
        .max(30)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*.])"))
        .required()
        .messages({
            "string.min": "Şifre en az 8 karakter olmalıdır",
            "string.max": "Şifre en fazla 30 karakter olabilir",
            "string.pattern.base": "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter (!@#$%) içermelidir",
            "string.empty": "Şifre alanı boş bırakılamaz",
            "any.required": "Şifre alanı zorunludur"
        })
});

// YARDIMCI: Veri Formatlama
const mapUser = (user) => {
    return {
        KullaniciID: user.kullaniciid,
        AdSoyad: user.adsoyad,
        Email: user.email,
        Rol: user.rol,
    };
};

// 1. GET USERS (Tüm Kullanıcıları Listele)
const getUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Kullanicilar ORDER BY KullaniciID ASC");
        res.json(result.rows.map(mapUser));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET USER BY ID (Tek Kullanıcı - Düzenleme Sayfası İçin)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM Kullanicilar WHERE KullaniciID = $1', [id]);
        if (result.rows.length === 0) return res.json([]);
        res.json([mapUser(result.rows[0])]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Sadece Kullanıcı ID'lerini getiren güvenli fonksiyon
const getPublicUserList = async (req, res) => {
    try {
        const result = await pool.query('SELECT KullaniciID FROM Kullanicilar');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Veri çekilemedi" });
    }
}

// 4. CREATE USER (Kayıt Ol)
const createUser = async (req, res) => {
    try {
        // 1. Validasyon (Aynen kalıyor)
        const { error } = registerSchema.validate(req.body, { 
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessages = error.details.map(detay => detay.message);
            return res.status(400).json({ 
                message: "Validasyon Hatası", 
                errors: errorMessages 
            });
        }

        const { AdSoyad, Email, Sifre } = req.body;

        // 2. Email Daha Önce Alınmış mı?
        const userCheck = await pool.query('SELECT * FROM Kullanicilar WHERE Email = $1', [Email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ message: "Bu email zaten kayıtlı!" });

        // 3. Domain'e Göre Rol Belirleme
        const domain = Email.split('@')[1].toLowerCase();
        
        let userRole = "standart"; // Varsayılan rol (Eğer ikisi de değilse)

        if (domain === "ogr.uludag.edu.tr") {
            userRole = "Öğrenci";
        } else if (domain === "uludag.edu.tr") {
            userRole = "Akademisyen";
        }

        // 4. Şifre Hashleme
        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(Sifre, salt);

        // 5. Kayıt İşlemi (SQL Sorgusuna 'Rol' alanını ekledik)
        const newUser = await pool.query(
            'INSERT INTO Kullanicilar (AdSoyad, Email, Sifre, Rol) VALUES ($1, $2, $3, $4) RETURNING *',
            [AdSoyad, Email, hashpass, userRole] 
        );
        
        res.json({ message: "Kayıt Başarılı!", user: mapUser(newUser.rows[0]) });

    } catch (error) {
        console.error("Kayıt Hatası:", error);
        res.status(500).json({ message: error.message });
    }
};

// 5. LOGIN (Giriş Yap)
const login = async (req, res) => {
    try {
        const { Email, Sifre } = req.body;
        const result = await pool.query('SELECT * FROM Kullanicilar WHERE Email = $1', [Email]);
        
        if (result.rows.length === 0) return res.status(400).json({ message: "Kullanıcı bulunamadı" });
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(Sifre, user.sifre);
        if (!validPassword) return res.status(400).json({ message: "Hatalı Şifre" });

        const token = jwt.sign(
            { id: user.kullaniciid, email: user.email, role: user.rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ message: "Giriş Başarılı", token, user: mapUser(user) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. UPDATE USER (Güncelle)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { AdSoyad, Email, Sifre } = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(Sifre, salt);

        await pool.query(
            'UPDATE Kullanicilar SET AdSoyad=$1, Email=$2, Sifre=$3 WHERE KullaniciID=$4',
            [AdSoyad, Email, hashpass, id]
        );
        res.json({ message: "Güncelleme Başarılı" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. DELETE USER (Kullanıcı Hesabını Sil)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.user.id;

        // --- GÜVENLİK KONTROLÜ ---
        // Eğer URL'deki ID ile Token'daki ID eşleşmiyorsa işlemi durdur.
        // (parseInt kullanıyoruz çünkü params string gelir, token number olabilir)
        if (parseInt(id) !== parseInt(requesterId)) {
            return res.status(403).json({ 
                message: "Yetkisiz işlem! Sadece kendi hesabınızı silebilirsiniz." 
            });
        }

        // 3. Silme İşlemi
        const result = await pool.query(
            'DELETE FROM Kullanicilar WHERE KullaniciID=$1 RETURNING *', 
            [id]
        );

        // Eğer silinecek kullanıcı zaten yoksa
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        res.json({ message: "Hesabınız başarıyla silindi." });

    } catch (error) {
        console.error("Silme Hatası:", error);
        res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
};

// HEPSİNİ DIŞARI AKTAR
module.exports = {
    getUsers,
    getUserById,
    getPublicUserList,
    createUser,
    login,
    updateUser,
    deleteUser,
};
