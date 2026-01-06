# 👁️ Kampüs Gözü (Campus Eye)

### 🎓 Uludağ University - Digital Issue Reporting & Mapping Platform

**Kampüs Gözü** is an interactive web application designed for students to report infrastructure problems, environmental issues, or requests (e.g., broken lights, HVAC failures, cleaning needs) directly to the university administration.

The platform utilizes **geolocation** to pin exact problem locations on a map, aiming to improve campus living standards through digital participation and rapid response mechanisms.

---

## 🚀 Key Features

* **🔒 Institutional Verification:** Strict signup policy allowing only users with a verified `@ogr.uludag.edu.tr` email address.
* **📍 Geolocation & Mapping:** Issues are reported with precise coordinates (Latitude/Longitude) using **Leaflet** integration.
* **📸 Evidence Based:** Users can attach photos and detailed descriptions to their reports.
* **📋 Status Tracking:** Lifecycle tracking for reported issues: *Pending Approval* ➔ *In Progress* ➔ *Resolved*.
* **📱 Responsive Design:** Fully accessible via mobile devices, tablets, and desktops.

---

## 🛠️ Tech Stack & Architecture

This project utilizes a **Cloud-Native Architecture**. The frontend is deployed on Vercel, while the backend API and database are hosted on Render.

### **Frontend (Client)**
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

### **Backend & Security**
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

### **Database**
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🔄 System Flow

The application follows a standard Client-Server model:

`React Client (Vercel)` ➔ `REST API (Render/Node.js)` ➔ `PostgreSQL Database (Render/Cloud)`

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally for development.

### 1. Prerequisites
Ensure you have the following installed:
* Node.js (v18 or higher)
* Docker & Docker Compose (for local database)

### 2. Clone the Repository
```bash
git clone [https://github.com/bilalst67/kampus-gozu.git](https://github.com/bilalst67/kampus-gozu.git)
cd kampus-gozu
npm install

```

### 3. Database Setup (Docker)

Start the PostgreSQL container for local development.

```bash
sudo docker run --name kampus_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=YourStrongPassword123! \
  -e POSTGRES_DB=KampusDB \
  -p 5432:5432 \
  --restart unless-stopped \
  -d postgres

```

### 4. Environment Variables

Create a `.env` file in the root directory and configure your credentials.

**For Local Development:**

```ini
# Database Configuration
DB_USER=postgres
DB_PASSWORD=YourStrongPassword123!
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=KampusDB

# Security
JWT_SECRET=your_super_secret_key

```

*> Note: When deploying to Render, add these variables to the Render Environment settings.*

### 5. Run the App

```bash
# Start Backend
cd server
node server.js

# Start Frontend (in a new terminal)
npm start

```

The application will run at `http://localhost:3000`.

---

## 🗄️ Database Schema

The project uses a Relational Database model powered by **PostgreSQL**.

* **Users Table (kullanicilar):** Stores student details with email domain validation.
* **Issues Table (sorunlar):** Stores issue details, related user ID, GPS coordinates, and status.

**Sample SQL Structure:**

```sql
CREATE TABLE sorunlar (
    sorun_id SERIAL PRIMARY KEY,
    baslik VARCHAR(100),
    aciklama TEXT,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    durum VARCHAR(20) DEFAULT 'Pending'
);

```

---

## 👤 Author

**Bilal Sarış**

* GitHub: [@bilalst67](https://www.google.com/search?q=https://github.com/bilalst67)
* *Developed for the Web Project Management Course.*

---

## 📄 License

Copyright 2025 Bilal Sarış.

Licensed under the Apache License, Version 2.0. See the [LICENSE](http://www.apache.org/licenses/LICENSE-2.0) file for details.
