import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./css/headPage.css"; 
import { isTokenExpired } from "../utils/auth";
import { showConfirm, showToast } from "../utils/customAlert";

function HeadPage() {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    
    // 1. KULLANICI ROLÜ İÇİN STATE
    const [userRole, setUserRole] = useState(""); 
    
    const navigate = useNavigate();

    const handleLogout = async () => {
        const onay = await showConfirm(
            "Çıkış yapılıyor",
            "Çıkış yapmak istediğinize emin misiniz?"
        );
        
        if (onay) {
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            navigate('/');
        }
    };

    // SCROLL DİNLEYİCİSİ
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // VERİ ÇEKME VE ROL KONTROLÜ
    useEffect(() => {
        const token = localStorage.getItem("token");
        // 2. ROLÜ LOCALSTORAGE'DAN AL
        const role = localStorage.getItem("userRole"); 

        if (!token) {
            navigate("/");
            return;
        }

        if (isTokenExpired(token)) {
            showToast("Oturum süreniz doldu. Lütfen tekrar giriş yapın.", "info");
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            navigate("/");
            return;
        }

        if (role) setUserRole(role);

        const fetchFeed = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/problem/full`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) throw new Error("Veri alınamadı");
                const data = await response.json();
                setFeed(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        
        fetchFeed();

    }, [navigate]); 

    const handleSupport = async (sorunId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            showToast("Desteklemek için giriş yapmalısınız!", "warning");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/problem/support/${sorunId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                const updatedFeed = feed.map(item => {
                    if (item.SorunID === sorunId) {
                        return { 
                            ...item, 
                            DestekSayisi: data.newCount,
                            Desteklendi: data.isLiked 
                        };
                    }
                    return item;
                });
                setFeed(updatedFeed);
            }
        } catch (err) {
            console.error("Destek hatası", err);
        }
    };

    if (loading) return (
        <div className="feed-loading">
            <div className="spinner"></div>
            <p>Akış Yükleniyor...</p>
        </div>
    );

    return (
        <div className="feed-container">
            <div className={`floating-navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="nav-content">
                    <h1 className="brand-logo">Kampüs Gözü</h1>
                    <div className="nav-actions">
                        
                        {/* ADMIN BUTONU */}
                        {userRole === 'admin' && (
                            <Link 
                                to="/anasayfa/profil/admin" 
                                className="icon-btn admin-btn"
                                data-tooltip="Yönetim Paneli"
                            >
                                🛡️
                            </Link>
                        )}

                        <Link 
                            to="/anasayfa/profil/yenisorun" 
                            className="icon-btn create-btn"
                            data-tooltip="Yeni Sorun" 
                        >
                            <span className="plus-icon">+</span>
                        </Link>
                        
                        <Link 
                            to="/anasayfa/profil" 
                            className="icon-btn"
                            data-tooltip="Profilim"
                        >
                            👤
                        </Link>
                        
                        <button 
                            onClick={handleLogout} 
                            className="icon-btn logout-btn"
                            data-tooltip="Çıkış Yap"
                        >
                            🚪
                        </button>
                    </div>
                </div>
            </div>

            {/* Akış Alanı */}
            <div className="feed-wrapper">
                {feed.map((post) => (
                    <div className="modern-card" key={post.SorunID}>
                        
                        <div className="card-header">
                            <div className="user-section">
                                <div className="modern-avatar">
                                    {post.AdSoyad ? post.AdSoyad.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div className="user-meta">
                                    <span className="username">{post.AdSoyad || "Anonim"}</span>
                                    <span className="location">📍 {post.KonumMetni || "Kampüs"}</span>
                                </div>
                            </div>
                            <span className={`modern-badge ${post.Durum === 'Çözüldü' ? 'success' : 'pending'}`}>
                                {post.Durum || 'Beklemede'}
                            </span>
                        </div>

                        {post.FotografUrl && (
                            <div className="card-media">
                                {/* --- DÜZELTME BURADA YAPILDI (sorun -> post) --- */}
                                <img 
                                    src={
                                        post.FotografUrl.startsWith('http') 
                                            ? post.FotografUrl 
                                            : `${import.meta.env.VITE_API_URL}${post.FotografUrl}`
                                    }  
                                    alt="Sorun" 
                                    loading="lazy"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}

                        <div className="card-body">
                            <div className="action-row">
                                <button 
                                    className={`modern-like-btn ${post.Desteklendi ? 'liked' : ''}`} 
                                    onClick={() => handleSupport(post.SorunID)}
                                >
                                    <span className="heart-icon">{post.Desteklendi ? "❤️" : "🤍"}</span>
                                    <span className="like-text">{post.Desteklendi ? "Desteklendi" : "Destekle"}</span>
                                </button>
                                <span className="like-count">
                                    <strong>{post.DestekSayisi || 0}</strong> destek
                                </span>
                            </div>

                            <div className="caption-area">
                                <h3 className="post-title">{post.Baslik}</h3>
                                <p className="post-desc">{post.Aciklama}</p>
                                <span className="post-time">
                                    {new Date(post.Tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bottom-space"></div>
        </div>
    );
}

export default HeadPage;