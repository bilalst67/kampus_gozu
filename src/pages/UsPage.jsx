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
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload).id;
        } catch (e) { return null; }
    };

    const checkNotifications = async (userId, token) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const notifications = await response.json();
                if (notifications.length > 0) {
                    notifications.forEach(notif => showToast(notif.Mesaj, "info"));
                }
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (sorunId) => {
        const onay = await showConfirm("Sil", "Bu kaydı silmek istediğinize emin misiniz?");
        if (!onay) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/problem/delete/${sorunId}`, { 
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                setUserData(userData.filter(item => item.SorunID !== sorunId));
                showToast("Kayıt silindi.", 'success');
            }
        } catch (error) { showToast("Hata oluştu.", 'error'); }
    };

    const handleLogout = async () => {
        const onay = await showConfirm("Çıkış", "Çıkış yapılsın mı?");
        if (onay) {
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            navigate('/');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }
        
        if (isTokenExpired(token)) {
            localStorage.removeItem("token");
            navigate("/");
            return;
        }

        const userId = getUserIdFromToken(token);
        fetch(`${import.meta.env.VITE_API_URL}/api/user/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setUserData(data);
            setLoading(false);
            checkNotifications(userId, token);
        })
        .catch(() => setLoading(false));

    }, [navigate]);

    if (loading) return <div className="us-loading"><div className="spinner"></div></div>;
    
    const adSoyad = userData.length > 0 ? userData[0].AdSoyad : "Kullanıcı";
    const rol = userData.length > 0 ? userData[0].Rol : "Öğrenci";

    return (
        <div className='us-body'>
            <div className="profile-container">
                <div className="profile-header">
                    <div className="header-left">
                        <div className="profile-avatar">{adSoyad.charAt(0).toUpperCase()}</div>
                        <div className="profile-info">
                            <h2>{adSoyad}</h2>
                            <span className="role-badge">{rol}</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <Link to="/anasayfa" className="home-action-btn">🏠</Link>
                        <Link to="/anasayfa/profil/ayarlar" className="settings-action-btn">⚙️</Link>
                        <button onClick={handleLogout} className="logout-action-btn">🚪</button>
                    </div>
                </div>

                <div className="problems-section">
                    <div className="section-title">
                        <h3>Bildirimlerim</h3>
                        <Link className='add-new-btn' to="/anasayfa/profil/yenisorun">+ Yeni</Link>
                    </div>

                    {userData.length === 0 || !userData[0].SorunID ? (
                        <div className="empty-state"><p>Henüz sorun bildirmediniz.</p></div>
                    ) : (
                        <div className="problems-grid">
                            {userData.map((kayit) => (
                                kayit.SorunID && (
                                    <div key={kayit.SorunID} className="problem-card">
                                        <div className="pc-image-wrapper">
                                            {kayit.FotografUrl ? (
                                                <img
                                                    src={
                                                        kayit.FotografUrl.startsWith('http') 
                                                            ? kayit.FotografUrl 
                                                            : `${import.meta.env.VITE_API_URL}${kayit.FotografUrl}`
                                                    } 
                                                    alt="Sorun"
                                                    onError={(e) => {e.target.style.display='none'}}
                                                />
                                            ) : <div className="no-image-placeholder">Resim Yok</div>}
                                            <span className={`pc-badge ${kayit.Durum === 'Çözüldü' ? 'solved' : 'waiting'}`}>
                                                {kayit.Durum || 'Beklemede'}
                                            </span>
                                        </div>
                                        <div className="pc-content">
                                            <h4 className="pc-title">{kayit.Baslik}</h4>
                                            <div className="pc-footer">
                                                <small>📅 {new Date(kayit.Tarih).toLocaleDateString('tr-TR')}</small>
                                                <button className="pc-delete-btn" onClick={() => handleDelete(kayit.SorunID)}>🗑️</button>
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