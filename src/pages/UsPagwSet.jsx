import { useEffect, useState } from "react";
import { showConfirm, showToast } from '../utils/customAlert';
import { Link, useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";
import "./css/usPageSet.css"; // CSS dosyasını import ediyoruz

function UsPageSet() {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        AdSoyad: "",
        Email: "",
        Sifre: "" // Şifre boş gelirse güncelleme, dolu gelirse güncelle mantığı
    });
    
    // Orijinal veriyi saklayalım ki iptal ederse geri dönelim
    const [originalData, setOriginalData] = useState({});
    
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

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }
        if (isTokenExpired(token)) {
            showToast("Oturum süreniz dolmuştur.", "info");
            localStorage.removeItem("token");
            navigate("/");
            return;
        }
        
        const userID = getUserIdFromToken(token);
        if (!userID) {
            showToast("Kimlik doğrulama hatası!", "error");
            navigate("/");
            return;
        }

        // --- VERİ ÇEKME ---
        fetch(`${import.meta.env.VITE_API_URL}/api/user/${userID}`, {
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
            // API muhtemelen bir array dönüyor [userObject]
            const userData = data[0] || data; 
            
            setOriginalData(userData);
            setFormData({
                AdSoyad: userData.AdSoyad || "",
                Email: userData.Email || "",
                Sifre: "" // Şifreyi güvenlik gereği boş bırakıyoruz
            });
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            showToast("Profil bilgileri alınamadı.", "error");
            setLoading(false);
        });
    }, [navigate]);

    // Input değişince çalışır
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Form Gönderme (GÜNCELLEME)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const onay = await showConfirm("Güncelle", "Profil bilgilerini güncellemek istiyor musunuz?");
        if(!onay) return;

        const token = localStorage.getItem("token");
        const userID = getUserIdFromToken(token);

        // Gönderilecek veri (Şifre boşsa gönderme)
        const updatePayload = {
            AdSoyad: formData.AdSoyad,
            Email: formData.Email
        };
        if (formData.Sifre.trim() !== "") {
            updatePayload.Sifre = formData.Sifre;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/update/${userID}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatePayload)
            });

            if (response.ok) {
                showToast("Profil başarıyla güncellendi.", "success");
                navigate("/anasayfa/profil"); // Profil sayfasına geri dön
            } else {
                const errData = await response.json();
                showToast(errData.message || "Güncelleme başarısız.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Sunucu hatası.", "error");
        }
    };

    // --- SİLME İŞLEMİ (YENİ) ---
    const handleDeleteAccount = async () => {
        const onay = await showConfirm(
            "⚠️ HESABINIZ SİLİNECEK!", 
            "Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir. Emin misiniz?"
        );

        if (!onay) return;

        const token = localStorage.getItem("token");
        const userID = getUserIdFromToken(token);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/delete/${userID}`, { 
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                showToast("Hesabınız başarıyla silindi. Güle güle...", "success");
                // Çıkış yap ve ana sayfaya at
                localStorage.removeItem("token");
                localStorage.removeItem("userRole");
                navigate("/");
            } else {
                const errData = await response.json();
                showToast(errData.message || "Silme işlemi başarısız.", "error");
            }

        } catch (error) {
            console.error(error);
            showToast("Sunucu hatası.", "error");
        }
    };
    if (loading) return (
        <div className="us-set-loading">
            <div className="spinner"></div>
            <p>Ayarlar Yükleniyor...</p>
        </div>
    );

    return (
        <div className="us-set-body">
            <div className="settings-container">
                
                {/* Header */}
                <div className="settings-header">
                    <h1>Profil Ayarları</h1>
                    <Link to="/anasayfa/profil" className="back-link">← Profile Dön</Link>
                </div>

                {/* Avatar Kısmı (Görsel) */}
                <div className="avatar-section">
                    <div className="big-avatar">
                        {formData.AdSoyad ? formData.AdSoyad.charAt(0).toUpperCase() : "U"}
                    </div>
                    <p className="avatar-name">{originalData.AdSoyad}</p>
                    <span className="avatar-role">{originalData.Rol || "Kullanıcı"}</span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="settings-form">
                    
                    <div className="form-group">
                        <label>Ad Soyad</label>
                        <input 
                            type="text" 
                            name="AdSoyad"
                            className="set-input"
                            value={formData.AdSoyad}
                            onChange={handleChange}
                            placeholder="Adınız Soyadınız"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>E-Posta Adresi</label>
                        <input 
                            type="email" 
                            name="Email"
                            className="set-input"
                            value={formData.Email}
                            onChange={handleChange}
                            placeholder="ornek@uludag.edu.tr"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Yeni Şifre <small>(Değiştirmek istemiyorsanız boş bırakın)</small></label>
                        <input 
                            type="password" 
                            name="Sifre"
                            className="set-input"
                            value={formData.Sifre}
                            onChange={handleChange}
                            placeholder="********"
                        />
                    </div>

                    <div className="button-group">
                        <button type="button" onClick={() => navigate("/anasayfa/profil")} className="cancel-btn">
                            İptal
                        </button>
                        <button type="submit" className="save-btn">
                            Değişiklikleri Kaydet
                        </button>
                    </div>

                </form>
                <div className="danger-zone">
                    <div className="danger-text">
                        <h3>Hesabı Sil</h3>
                        <p>Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak kaybolur.</p>
                    </div>
                    <button 
                        type="button" 
                        className="delete-account-btn"
                        onClick={handleDeleteAccount}
                    >
                        Hesabımı Sil
                    </button>
                </div>
                
            </div>
        </div>
    );
}
export default UsPageSet;