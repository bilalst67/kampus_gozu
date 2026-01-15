const multer = require('multer');
const path = require('path');

// Depolama Ayarları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Resimler ana dizindeki 'uploads' klasörüne gitsin
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Dosya ismi çakışmasın diye tarih + orijinal isim yapıyoruz
        // Örn: 17382392_manzara.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

// Sadece Resim Dosyalarını Kabul Et (Güvenlik)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
