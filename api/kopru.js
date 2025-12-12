const dataConnect=require('./db.js')

module.exports = async (req, res) => {
    
    const { islem } = req.query; // URL'den ne yapmak istediğini alacağız (?islem=kayit veya ?islem=giris)

    // --- KAYIT OLMA İŞLEMİ ---
    if (req.method === 'POST' && islem === 'kayit') {
        const { adsoyad, email, sifre } = req.body;

        // 1. KURAL: Mail uzantısı kontrolü (Backend tarafında güvenlik)
        if (!email.endsWith('@ogr.uludag.edu.tr')) {
            return res.status(400).json({ error: 'Sadece @ogr.uludag.edu.tr maili ile kayıt olabilirsiniz!' });
        }

        try {
            // Veritabanına ekle
            await executeQuery(
                'INSERT INTO Kullanicilar (AdSoyad, Email, Sifre) VALUES (@Ad, @Email, @Sifre)',
                [
                    { name: 'Ad', type: sql.NVarChar, value: adsoyad },
                    { name: 'Email', type: sql.NVarChar, value: email },
                    { name: 'Sifre', type: sql.NVarChar, value: sifre } // Gerçek projede şifre hashlenmeli ama şimdilik böyle kalsın
                ]
            );
            res.status(200).json({ message: 'Kayıt başarılı! Giriş yapabilirsiniz.' });

        } catch (error) {
            // Eğer aynı mail varsa SQL hata verir
            if(error.number === 2627) {
                res.status(400).json({ error: 'Bu mail adresi zaten kayıtlı.' });
            } else {
                res.status(500).json({ error: 'Sunucu hatası.' });
            }
        }
    }

    // --- GİRİŞ YAPMA İŞLEMİ ---
    else if (req.method === 'POST' && islem === 'giris') {
        const { email, sifre } = req.body;

        try {
            // Kullanıcıyı bul
            const users = await executeQuery(
                'SELECT * FROM Kullanicilar WHERE Email = @Email AND Sifre = @Sifre',
                [
                    { name: 'Email', type: sql.NVarChar, value: email },
                    { name: 'Sifre', type: sql.NVarChar, value: sifre }
                ]
            );

            if (users.length > 0) {
                // Kullanıcı bulundu!
                // Güvenlik için şifreyi geri göndermiyoruz
                const user = users[0];
                res.status(200).json({ 
                    success: true, 
                    user: { id: user.KullaniciID, ad: user.AdSoyad, email: user.Email } 
                });
            } else {
                res.status(401).json({ error: 'Mail adresi veya şifre hatalı.' });
            }

        } catch (error) {
            res.status(500).json({ error: 'Giriş yapılamadı.' });
        }
    }
};