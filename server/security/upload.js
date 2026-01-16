const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//Depolama ayarları
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'kampus_gozu_uploads',
        allowed_formats: ['jpg', 'png', 'jpeg'], // İzin verilen formatlar
    },
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
