import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../utils/auth';
import { showConfirm, showToast } from '../utils/customAlert';
import "./css/usPage.css";

function UsPage() {
    const [userData, setUserData] = useState([]); 
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const getUserIdFromToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload).id;
        } catch (e) {
            return null;
        }
    };

    // --- BİLDİRİM KONTROLÜ ---
    const checkNotifications = async (userId, token) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (response.ok) {
                const notifications = await response.json();
                if (notifications.length > 0) {
                    notifications.forEach(notif => {
                        showToast(notif.mesaj, "error");
                    });
                }
            }
        } catch (error) {
            console.error("Bildirim kontrol hatası:", error);
        }
    };

    const handleDelete = async (sorunId) => {
        const onay = await showConfirm(
            "Silmek İstiyor musunuz?", 
            "Bu sorun kaydı kalıcı olarak silinecektir."
        );

        if (!onay) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/problem/${sorunId}`, { 
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const yeniListe = userData.filter(item => item.SorunID !== sorunId);
                setUserData(yeniListe);
                showToast("Sorun başarıyla silindi.", 'success');
            } else {
                showToast("Silme işlemi başarısız.", 'error');
            }

        } catch (error) {
            console.error("Silme hatası:", error);
            showToast("Sunucuya bağlanılamadı.", 'error');
        }
    };

    const handleLogout = async () => {
        const onay = await showConfirm(
            "Çıkış Yapılıyor",
            "Hesabınızdan çıkış yapmak istediğinize emin misiniz?"
        );
        
        if (onay) {
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            navigate('/');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }
        if (isTokenExpired(token)) {
            showToast("Oturum süreniz doldu.", 'info');
            localStorage.removeItem("token");
            navigate("/");
            return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            showToast("Kimlik doğrulama hatası!", 'error');
            navigate("/");
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/user/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(res => {
            if (!res.ok) throw new Error("Veri çekilemedi");
            return res.json();
        })
        .then(data => {
            setUserData(data);
            setLoading(false);
            checkNotifications(userId, token);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });

    }, [navigate]);

    if (loading) return (
        <div className="us-loading">
            <div className="spinner"></div>
            <p>Profil Yükleniyor...</p>
        </div>
    );

    const kullaniciAdi = userData.length > 0 ? userData[0].AdSoyad : "Kullanıcı";
    const kullaniciRol = userData.length > 0 ? userData[0].Rol : "Öğrenci";

    return (
        <div className='us-body'>
            <div className="profile-container">
                
                <div className="profile-header">
                    <div className="header-left">
                        <div className="profile-avatar">
                            {kullaniciAdi ? kullaniciAdi.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="profile-info">
                            <h2>Hoşgeldin, {kullaniciAdi} 👋</h2>
                            <span className="role-badge">{kullaniciRol}</span>
                        </div>
                    </div>
                    
                    <div className="header-right">
                        <Link to="/anasayfa" className="home-action-btn">
                            🏠 Ana Sayfa
                        </Link>
                        <Link to="/anasayfa/profil/ayarlar" className="settings-action-btn">
                            ⚙️ Ayarlar
                        </Link>
                        <button onClick={handleLogout} className="logout-action-btn" title="Çıkış Yap">
                            🚪 Çıkış Yap
                        </button>
                    </div>
                </div>

                <div className="problems-section">
                    <div className="section-title">
                        <h3>Bildirdiğim Sorunlar</h3>
                        <Link className='add-new-btn' to="/anasayfa/profil/yenisorun">+ Yeni Ekle</Link>
                    </div>

                    {userData.length === 0 || !userData[0].SorunID ? (
                        <div className="empty-state">
                            <p>Henüz bir sorun bildirmediniz.</p>
                        </div>
                    ) : (
                        <div className="problems-grid">
                            {userData.map((kayit) => (
                                kayit.SorunID && (
                                    <div key={kayit.SorunID} className="problem-card">
                                    
                                        <div className="pc-image-wrapper">
                                            {kayit.FotografUrl ? (
                                                <img
                                                    // --- DÜZELTME BURADA YAPILDI (post -> kayit) ---
                                                    src={
                                                        kayit.FotografUrl.startsWith('http') 
                                                            ? kayit.FotografUrl 
                                                            : `${import.meta.env.VITE_API_URL}${kayit.FotografUrl}`
                                                    } 
                                                    alt="Sorun"
                                                    onError={(e) => {e.target.style.display='none'}}
                                                />
                                            ) : (
                                                <div className="no-image-placeholder">Görsel Yok</div>
                                            )}
                                            <span className={`pc-badge ${kayit.Durum === 'Çözüldü' ? 'solved' : 'waiting'}`}>
                                                {kayit.Durum || 'Beklemede'}
                                            </span>
                                        </div>

                                        <div className="pc-content">
                                            <h4 className="pc-title">{kayit.Baslik}</h4>
                                            <p className="pc-desc">{kayit.Aciklama}</p>
                                            
                                            <div className="pc-footer">
                                                <small className="pc-date">
                                                    📅 {new Date(kayit.Tarih).toLocaleDateString('tr-TR')}
                                                </small>
                                                <button 
                                                    className="pc-delete-btn"
                                                    onClick={() => handleDelete(kayit.SorunID)}
                                                >
                                                    Sil 🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UsPage;