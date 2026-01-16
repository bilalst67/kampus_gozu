import { Link } from "react-router-dom";
import list from "../assets/list.svg";
import "./css/loadPage.css";
import { useEffect, useState } from "react";
import Map from "./companents/loadMap"; 

function LoadPage() {
    const [isplay, setisplay] = useState(false);
    const [problems, setProblems] = useState([]);
    const [userCount, setUserCount] = useState(0); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [problemsRes, usersRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/public/problems`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/public/users`)
                ]);

                if (!problemsRes.ok || !usersRes.ok) throw new Error("Veri çekme hatası");

                const problemsData = await problemsRes.json();
                const usersData = await usersRes.json();

                // --- DÜZELTME BURADA ---
                // Haritayı çökerten (NaN) verileri temizliyoruz
                const validProblems = problemsData.filter(item => 
                    item.Latitude != null && 
                    item.Longitude != null && 
                    !isNaN(parseFloat(item.Latitude)) && 
                    !isNaN(parseFloat(item.Longitude))
                );

                setProblems(validProblems); // Sadece sağlam verileri gönder
                setUserCount(usersData.length); 

            } catch (error) {
                console.error("Hata:", error);
            }
        };
        fetchData();
    }, []);
    
    return (
        <div className="Loadpage">
            <div className="navbar">
                <span className="headText">Kampüs Gözü</span>
                <button 
                    className={`buton ${isplay? "acik":""}`} 
                    onClick={() => setisplay(!isplay)}
                >
                    <img src={list} alt="Menü" width="20" />
                </button>
                <ul className={`slide-panel ${isplay ? "acik" : ""}`}>
                    <li><Link className="link" to='/login'>Giriş yap</Link></li>
                    <li><Link className="link" to='/signin'>Kayıt Ol</Link></li>
                </ul>
            </div>

            <div className="hero-bolumu">
                <h1>Kampüs Gözü'ne Hoşgeldiniz</h1>
                <p>Üniversitemizi birlikte daha yaşanabilir hale getirelim.</p>
            </div>

            <div className="example-use">
                <div className="section-container">
                    <span className="bottomHeadText">Kampüsün Nabzını Tut</span>
                    <p className="section-desc">Kampüsteki sorunları harita üzerinde anlık görüntüleyin.</p>
                    <div style={{ marginTop: "20px", height: "400px" }}>
                        {/* Harita bileşeni artık sadece sağlam verilerle çalışacak */}
                        <Map sorunlar={problems} />
                    </div>
                </div>

                <div className="section-container how-it-works">
                    <span className="bottomHeadText">Nasıl Çalışır?</span>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon">📸</div>
                            <h3>Fotoğraf Çek</h3>
                            <p>Gördüğün sorunun fotoğrafını çek ve sisteme yükle.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">📍</div>
                            <h3>Konum İşaretle</h3>
                            <p>Harita üzerinden sorunun tam konumunu belirle.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-icon">🚀</div>
                            <h3>Destek Topla</h3>
                            <p>Diğer öğrenciler sorunu desteklesin, çözüm hızlansın.</p>
                        </div>
                    </div>
                </div>

                <div className="stats-banner">
                    <div className="stat-item">
                        <span className="stat-number">{problems.length}</span>
                        <span className="stat-label">Bildirilen Sorun</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {problems.filter(p => p.Durum === 'Çözüldü').length}
                        </span>
                        <span className="stat-label">Çözülen Sorun</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {userCount}
                        </span>
                        <span className="stat-label">Aktif Öğrenci</span>
                    </div>
                </div>

                <footer className="page-footer">
                    <div className="footer-content">
                        <p>&copy; 2026 Kampüs Gözü - Tüm Hakları Saklıdır.</p>
                        <p>Geliştirici: <a href="https://github.com/bilalst67" target="_blank" rel="noreferrer">Bilal Sarış (@bilalst67)</a></p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default LoadPage;