const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require('./routes/userRoutes'); // Rotaları import ettik

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotaları Kullan
// "/api" ön eki ile gelen her isteği userRoutes dosyasına gönder
app.use('/api', userRoutes);

// Ana Route (Test için)
app.get('/', (req, res) => {
    res.send("MVC Yapılı Backend Çalışıyor!");
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor...`);
});
