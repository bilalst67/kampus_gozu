# 👁️ Kampüs Gözü (Campus Eye)

### 🎓 Uludağ University - Digital Issue Reporting & Mapping Platform

**Kampüs Gözü** is an interactive web application designed for students and academicians to report infrastructure problems, environmental issues, or requests directly to the university administration.

The platform utilizes **geolocation** to pin exact problem locations on a map, aiming to improve campus living standards through digital participation and rapid response mechanisms.

---

## 🚀 Key Features

* **🔒 Institutional Verification:** Strict signup policy allowing only users with a verified `@ogr.uludag.edu.tr` or `@uludag.edu.tr` email address via SMTP verification.
* **📍 Geolocation & Mapping:** Issues are reported with precise coordinates using **Leaflet** integration. Users can select locations directly on the map.
* **🛡️ Admin Panel:** Dedicated interface for administrators to Approve, Reject, or mark issues as Resolved.
* **📸 Evidence Based:** Users can upload photos via **Multer** to support their reports.
* **👍 Community Support:** Students can "Support" (Like) reported issues to increase their priority.
* **🔔 Notifications:** Users receive system notifications regarding the status of their reports.
* **🔐 Advanced Security:** Protected with **Helmet**, **Rate Limiting**, **CORS** policies, and **JWT** authentication.

---

## 🛠️ Tech Stack

This project utilizes a **Client-Server Architecture**.

### **Frontend (Client)**
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### **Backend & Security**
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Nodemailer](https://img.shields.io/badge/Nodemailer-007ACC?style=for-the-badge&logo=gmail&logoColor=white)

### **Database**
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

---

## 🔄 System Flow

The application follows a standard Client-Server model:

`React Client` ➔ `REST API (Express.js)` ➔ `MySQL Database`

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally for development.

### 1. Prerequisites
Ensure you have the following installed:
* Node.js (v18 or higher)
* MySQL Server (Local or Cloud)

### 2. Clone the Repository
```bash
git clone [https://github.com/bilalst67/kampus_gozu.git](https://github.com/bilalst67/kampus_gozu.git)
cd kampus_gozu
```
### 3. Database Setup

Create a MySQL database named KampusDB and import the schema (tables structure provided below).

### 4. Environment Variables

Create a .env file in the server directory and configure your credentials.
Ini, TOML
```
# Server Config
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASS=YourStrongPassword
DB_NAME=KampusDB

# Security
JWT_SECRET=your_super_secret_key_change_this

# Email Service (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```
### 5. Run the App

Backend:
```Bash

cd server
npm install
node server.js
```
Frontend:
```Bash

# In a new terminal
cd client
npm install
npm run dev
```
The application will run at http://localhost:5173 (Vite default) or http://localhost:3000.

## 🗄️ Database Schema (MySQL)

The project uses a Relational Database model powered by MySQL.

Users Table (Kullanicilar)
```SQL

CREATE TABLE Kullanicilar (
    KullaniciID INT AUTO_INCREMENT PRIMARY KEY,
    Ad VARCHAR(50) NOT NULL,
    Soyad VARCHAR(50) NOT NULL,
    KullaniciAdi VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Sifre VARCHAR(255) NOT NULL,
    Rol VARCHAR(20) DEFAULT 'Öğrenci',
    IsVerified TINYINT(1) DEFAULT 0,
    VerificationToken VARCHAR(100)
);
```
Issues Table (Sorunlar)
```SQL

CREATE TABLE Sorunlar (
    SorunID INT AUTO_INCREMENT PRIMARY KEY,
    KullaniciID INT,
    Baslik VARCHAR(100),
    Aciklama TEXT,
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    KonumMetni VARCHAR(255),
    FotografUrl VARCHAR(255),
    Durum VARCHAR(20) DEFAULT 'Beklemede',
    Tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (KullaniciID) REFERENCES Kullanicilar(KullaniciID) ON DELETE CASCADE
);
```
Supports Table (Destekler)
```SQL

CREATE TABLE Destekler (
    DestekID INT AUTO_INCREMENT PRIMARY KEY,
    KullaniciID INT,
    SorunID INT,
    FOREIGN KEY (KullaniciID) REFERENCES Kullanicilar(KullaniciID),
    FOREIGN KEY (SorunID) REFERENCES Sorunlar(SorunID) ON DELETE CASCADE
);
```
Notifications Table (Bildirimler)
```SQL

CREATE TABLE Bildirimler (
    BildirimID INT AUTO_INCREMENT PRIMARY KEY,
    KullaniciID INT,
    Mesaj TEXT NOT NULL,
    Okundu TINYINT(1) DEFAULT 0,
    Tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (KullaniciID) REFERENCES Kullanicilar(KullaniciID) ON DELETE CASCADE
);
```
---

## 👤 Author

**Bilal Sarıtaş**

* GitHub: [@bilalst67](https://www.google.com/search?q=https://github.com/bilalst67)
* *Developed for the Web Project Management Course.*

---

## 📄 License

Copyright 2026 Bilal Sarıtaş.

Licensed under the Apache License, Version 2.0. See the [LICENSE](http://www.apache.org/licenses/LICENSE-2.0) file for details.
