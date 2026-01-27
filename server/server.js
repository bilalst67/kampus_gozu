const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit");
const errorHandler = require('./middlewares/errorHandler');
require("dotenv").config();

const userRoutes = require('./routes/routes'); 

const app = express();
const PORT = process.env.PORT || 5000;

// 1. HTTPS Yönlendirmesi (Reverse Proxy Uyumluluğu)
app.use((req, res, next) => {
    if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

// 2. Gizlilik ve Güvenlik
app.disable('x-powered-by'); 

const whitelist = [
    "https://kampusgozu.com",
    "https://www.kampusgozu.com",
    "https://kampus-gozu.vercel.app" 
];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('CORS Hatası: Bu domaine erişim izni verilmemiştir.'));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// 3. Helmet & CSP Konfigürasyonu
app.use(helmet({
    frameguard: { action: "deny" },
    hsts: {
        maxAge: 31536000, 
        includeSubDomains: true, 
        preload: true 
    },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], 
            scriptSrc: ["'self'", "https://*.openstreetmap.org", "https://*.tile.openstreetmap.org"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], 
            imgSrc: ["'self'", "data:", "blob:", "https://*.openstreetmap.org", "https://*.tile.openstreetmap.org"],
            connectSrc: ["'self'", "https://*.openstreetmap.org"], 
            fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"], 
            objectSrc: ["'none'"],
            mediaSrc: ["'none'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    dnsPrefetchControl: { allow: false },
}));

// 4. Permissions Policy
app.use((req, res, next) => {
    res.setHeader(
        "Permissions-Policy",
        "geolocation=(self), microphone=(), camera=(), payment=(), usb=()"
    );
    next();
});

// 5. Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { message: "Çok fazla istek, lütfen daha sonra tekrar deneyin." },
    standardHeaders: true, 
    legacyHeaders: false, 
    trustProxy: true 
});

app.set('trust proxy', 1); 
app.use('/api', limiter);

// Middleware ve Route Tanımlamaları
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', userRoutes);

app.use(express.static(path.join(__dirname, 'build')));

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🛡️  Server ${PORT} portunda çalışıyor.`);
});