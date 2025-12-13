👁️ Kampüs Gözü (Campus Eye)

Uludağ University - Digital Issue Reporting & Mapping Platform

Kampüs Gözü is an interactive web application designed for students to report infrastructure problems, environmental issues, or requests (e.g., broken lights, HVAC failures, cleaning needs) directly to university administration. The platform utilizes geolocation to pin exact problem locations on a map.

This project aims to improve campus living standards through digital participation and rapid response mechanisms.
🚀 Key Features

    🔒 Institutional Verification: Strict signup policy allowing only users with an @ogr.uludag.edu.tr email address to register.

    📍 Geolocation & Mapping: Issues are reported with precise coordinates (Latitude/Longitude) using Leaflet/Map integration.

    📸 Evidence Based: Users can attach photos and detailed descriptions to their reports.

    📋 Status Tracking: Reported issues are tracked through a lifecycle: "Pending Approval", "In Progress", and "Resolved".

    📱 Responsive Design: Fully accessible via mobile devices and tablets.

🛠️ Tech Stack & Architecture

This project utilizes a Hybrid Cloud Architecture, connecting a cloud-hosted frontend to a local containerized database via secure tunneling.

    Frontend: React.js (Hooks, Context API)

    Backend / API: Node.js (Vercel Serverless Functions)

    Database: Microsoft SQL Server 2022 (Running on Docker)

    Networking/Tunneling: Playit.gg (TCP Tunneling for Local-to-Cloud connectivity)

    Hosting: Vercel

System Flow

React Client ➔ Vercel API ➔ Playit.gg Tunnel ➔ Local Machine (Port 25565) ➔ Docker Container ➔ MSSQL
⚙️ Installation & Setup

Follow these steps to run the project locally.
1. Prerequisites

Ensure you have the following installed:

    Node.js (v18 or higher)

    Docker & Docker Compose

2. Clone the Repository
Bash

git clone https://github.com/bilalst67/kampus-gozu.git
cd kampus-gozu
npm install

3. Database Setup (Docker)

Start the SQL Server container. We map the container's default port (1433) to 25565 to work with the tunneling setup.
Bash

sudo docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrongPassword123!" \
   -p 25565:1433 --name sql_server \
   --restart unless-stopped \
   -d mcr.microsoft.com/mssql/server:2022-latest

4. Tunnel Configuration (Playit.gg)

To allow the Vercel backend to talk to your local database:

    Run the Playit agent: ./playit

    Select "Minecraft Java" tunnel type (this forwards TCP traffic).

    Note the Address and Port provided by Playit.

5. Environment Variables

Create a .env file in the root directory and configure your credentials:
Kod snippet'i

# Database Configuration
DB_USER=sa
DB_PASSWORD=YourStrongPassword123!
DB_SERVER=your-tunnel-address.gl.joinmc.link
DB_PORT=your-tunnel-port
DB_DATABASE=KampusDB

6. Run the App
Bash

npm start

The application will run at http://localhost:3000.
🗄️ Database Schema

The project uses a Relational Database model.

    Users Table (Kullanicilar): Stores student details with email domain validation.

    Issues Table (Sorunlar): Stores issue details, related user ID, GPS coordinates, and status.

Sample SQL Structure:
SQL

CREATE TABLE Sorunlar (
    SorunID INT PRIMARY KEY IDENTITY(1,1),
    Baslik NVARCHAR(100),
    Aciklama NVARCHAR(MAX),
    Latitude DECIMAL(9, 6),
    Longitude DECIMAL(9, 6),
    Durum NVARCHAR(20) DEFAULT 'Pending'
);

👤 Author

Bilal Sarış

    GitHub: @bilalst67

    Developed for the Web Project Management Course.

📄 License

Copyright 2025 Bilal Sarış

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.