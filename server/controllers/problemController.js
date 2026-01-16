const { pool } = require('../config/db');
require("dotenv").config();

// Veri tabanından gelen veriyi Frontend'in anlayacağı şekle çeviren fonksiyon
const mapUser = (row) => {
    return {
        // Kullanıcı Bilgileri
        KullaniciID: row.kullaniciid,
        AdSoyad: row.adsoyad, // JOIN sayesinde artık gelecek
        Email: row.email,
        Rol: row.rol,

        // Sorun Bilgileri
        SorunID: row.sorunid,
        Baslik: row.baslik,
        Aciklama: row.aciklama,
        Latitude: row.latitude,
        Longitude: row.longitude,
        KonumMetni: row.konummetni,
        FotografUrl: row.fotografurl,
        Durum: row.durum,
        Tarih: row.tarih,
        
        // Ekstra Bilgiler
        DestekSayisi: parseInt(row.desteksayisi || 0),
        Desteklendi: row.desteklendi || false // Backend'den true/false gelecek
    };
};

// 1. KULLANICI PROFİLİ VE SORUNLARI (Tek Kişi)
const userreq = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kullanıcıyı ve sadece ONUN bildirdiği sorunları getir
        const query = `
            SELECT k.*, s.* FROM Kullanicilar k
            LEFT JOIN Sorunlar s ON k.KullaniciID = s.KullaniciID
            WHERE k.KullaniciID = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.json([]);
        }
        
        const formattedData = result.rows.map(mapUser);
        return res.json(formattedData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// 2. YENİ SORUN OLUŞTURMA
const userCreateProblem = async (req, res) => {
    try {
        // Token'dan gelen ID (AuthMiddleware sayesinde buradadır)
        const KullaniciID = req.user.id; 
        
        const { Baslik, Aciklama, Latitude, Longitude, KonumMetni } = req.body;

        // Dosya yüklendiyse yolunu al, yüklenmediyse null geç
        const FotografUrl = req.file ? req.file.path : null;

        if (!Baslik || !Aciklama || !Latitude || !Longitude) {
            return res.status(400).json({ message: "Başlık, Açıklama ve Konum bilgileri zorunludur!" });
        }

        const query = `
            INSERT INTO Sorunlar 
            (KullaniciID, Baslik, Aciklama, Latitude, Longitude, KonumMetni, FotografUrl) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING * `;

        const result = await pool.query(query, [
            KullaniciID, 
            Baslik, 
            Aciklama, 
            parseFloat(Latitude), 
            parseFloat(Longitude), 
            KonumMetni,
            FotografUrl
        ]);

        res.json({
            message: "Sorun başarıyla bildirildi!",
            sorun: result.rows[0]
        });

    } catch (err) {
        console.error("Sorun ekleme hatası: " + err);
        res.status(500).json({ message: "Sunucu hatası oluştu." }); 
    }
}

// 3. Sorun silme
const userDeleteProblem=async(req,res)=>{
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM Sorunlar WHERE SorunID=$1', [id])
        res.json({ message: "Sorun Silindi" });
    } catch (err) {
        console.error("Hata oluştu :"+err)
    }
}

const deleteProblemAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // ÖNCE: Silinecek sorunun sahibini ve başlığını bulalım
        const findQuery = 'SELECT KullaniciID, Baslik FROM Sorunlar WHERE SorunID = $1';
        const findResult = await pool.query(findQuery, [id]);

        if (findResult.rows.length === 0) {
            return res.status(404).json({ message: "Sorun bulunamadı" });
        }

        const { kullaniciid, baslik } = findResult.rows[0];

        // BİLDİRİM EKLE: "Şu başlıklı sorununuz reddedildi."
        const notificationMsg = `"${baslik}" başlıklı sorununuz admin tarafından reddedildi ve silindi.`;
        await pool.query(
            'INSERT INTO Bildirimler (KullaniciID, Mesaj) VALUES ($1, $2)',
            [kullaniciid, notificationMsg]
        );

        // SONRA: Sorunu Sil
        await pool.query('DELETE FROM Sorunlar WHERE SorunID = $1', [id]);

        res.json({ message: "Sorun silindi ve kullanıcıya bildirim gönderildi." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "İşlem başarısız" });
    }
};

// 4. TÜM SORUNLARI LİSTELEME (Anasayfa Akışı İçin)
const fullProblem = async (req, res) => {
    try {
        // İsteği atan kullanıcının ID'sini al (Token varsa)
        const currentUserId = req.user ? req.user.id : 0;

        const query = `
            SELECT 
                s.*,
                k.AdSoyad, 
                k.Rol,
                (SELECT COUNT(*) FROM Destekler d WHERE d.SorunID = s.SorunID) as DestekSayisi,
                (CASE WHEN EXISTS (SELECT 1 FROM Destekler d2 WHERE d2.SorunID = s.SorunID AND d2.KullaniciID = $1) THEN TRUE ELSE FALSE END) as Desteklendi
            FROM Sorunlar s
            JOIN Kullanicilar k ON s.KullaniciID = k.KullaniciID
            ORDER BY DestekSayisi DESC, s.Tarih DESC
        `;
        
        // $1 parametresine currentUserId'yi gönderiyoruz
        const result = await pool.query(query, [currentUserId]);
        const formattedData = result.rows.map(mapUser);
        
        res.json(formattedData); 

    } catch (err) {
        console.error("Hata oluştu :" + err);
        res.status(500).json({ message: err.message });
    }
}

//5-ADMIN için PROBLEM GĞNCELLEMESI
const updateProblemStatus = async (req, res) => {
    try {
        const { id } = req.params; // Sorun ID
        const { Durum } = req.body; // Yeni Durum (Örn: "Onaylandı", "Çözüldü", "Reddedildi")

        // Durum boş mu kontrol et
        if (!Durum) {
            return res.status(400).json({ message: "Durum bilgisi gereklidir." });
        }

        const query = `
            UPDATE Sorunlar 
            SET Durum = $1 
            WHERE SorunID = $2 
            RETURNING *
        `;

        const result = await pool.query(query, [Durum, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Sorun bulunamadı." });
        }

        res.json({ 
            message: `Sorun durumu '${Durum}' olarak güncellendi.`, 
            sorun: result.rows[0] 
        });

    } catch (err) {
        console.error("Durum güncelleme hatası:", err);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

//6-DESTEKLE FONKSIYONU
const toggleSupport = async (req, res) => {
    try {
        const { id } = req.params; // Sorun ID
        const KullaniciID = req.user.id; // Token'dan gelen kullanıcı ID

        // 1. Önce kontrol et: Bu kullanıcı bu sorunu daha önce desteklemiş mi?
        const checkQuery = `SELECT * FROM Destekler WHERE KullaniciID = $1 AND SorunID = $2`;
        const checkResult = await pool.query(checkQuery, [KullaniciID, id]);

        let isLiked = false;

        if (checkResult.rows.length > 0) {
            // VARSA -> SİL (UNLIKE)
            await pool.query(`DELETE FROM Destekler WHERE KullaniciID = $1 AND SorunID = $2`, [KullaniciID, id]);
            isLiked = false;
        } else {
            // YOKSA -> EKLE (LIKE)
            await pool.query(`INSERT INTO Destekler (KullaniciID, SorunID) VALUES ($1, $2)`, [KullaniciID, id]);
            isLiked = true;
        }

        // 2. Güncel destek sayısını hesapla
        const countQuery = `SELECT COUNT(*) FROM Destekler WHERE SorunID = $1`;
        const countResult = await pool.query(countQuery, [id]);
        
        // Frontend'e yeni durumu gönder
        res.json({
            success: true,
            isLiked: isLiked, // Artık beğendi mi beğenmedi mi?
            newCount: parseInt(countResult.rows[0].count) // Yeni toplam sayı
        });

    } catch (err) {
        console.error("Destekleme hatası:", err);
        res.status(500).json({ message: "İşlem başarısız" });
    }
};

// Adminin TÜM sorunları (gizli/açık/onaylı/onaysız) görebilmesi için
const getAllProblemsForAdmin = async (req, res) => {
    try {
        // Kullanıcı bilgileriyle beraber çekiyoruz
        const query = `
            SELECT 
                s.*, 
                k.AdSoyad, 
                k.Email,
                (SELECT COUNT(*) FROM Destekler d WHERE d.SorunID = s.SorunID) AS desteksayisi
            FROM Sorunlar s
            JOIN Kullanicilar k ON s.KullaniciID = k.KullaniciID
            ORDER BY s.Tarih DESC
        `;
        const result = await pool.query(query);
        const resultfin= result.rows.map(mapUser);
        res.json(resultfin);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Veri çekilemedi" });
    }
};

// 7 - LOAD pagede gözüken yer
const getPublicProblems = async (req, res) => {
    try {
        // PostgreSQL sütunları küçük harfe çevirir. 
        // Frontend büyük harf (Latitude) beklediği için AS "Latitude" diyerek zorluyoruz.
        const query = `
            SELECT 
                SorunID as "SorunID", 
                Baslik as "Baslik", 
                Aciklama as "Aciklama", 
                Latitude as "Latitude", 
                Longitude as "Longitude", 
                KonumMetni as "KonumMetni", 
                Durum as "Durum" 
            FROM Sorunlar 
            ORDER BY Tarih DESC
        `;
        
        const result = await pool.query(query);
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Veri çekilemedi" });
    }
}
// 7 Bildirim gösterme
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        // Okunmamış bildirimleri çek
        const result = await pool.query(
            'SELECT * FROM Bildirimler WHERE KullaniciID = $1 AND Okundu = FALSE ORDER BY Tarih DESC',
            [userId]
        );

        // Eğer bildirim varsa, onları hemen "Okundu" olarak işaretle (Bir daha göstermemek için)
        if (result.rows.length > 0) {
            await pool.query(
                'UPDATE Bildirimler SET Okundu = TRUE WHERE KullaniciID = $1',
                [userId]
            );
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Bildirimler alınamadı" });
    }
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
