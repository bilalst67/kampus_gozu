import { useEffect, useState } from "react";
import { showConfirm, showToast } from '../utils/customAlert';
import { Link, useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";
import "./css/usPageSet.css";

function UsPageSet() {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        Ad: "",
        Soyad: "",
        KullaniciAdi: "",
        Email: "",
        Sifre: ""
    });
    
    const navigate = useNavigate();

    const getUserIdFromToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload).id;
        } catch (e) { return null; }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || isTokenExpired(token)) {
            navigate("/");
            return;
        }

        const fetchUserData = async () => {
            const userId = getUserIdFromToken(token);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.length > 0) {
                    setFormData({
                        Ad: data[0].Ad,
                        Soyad: data[0].Soyad,
                        KullaniciAdi: data[0].KullaniciAdi,
                        Email: data[0].Email,
                        Sifre: "" 
                    });
                }
                setLoading(false);
            } catch (error) {
                showToast("Kullanıcı bilgileri alınamadı", "error");
            }
        };
        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const userId = getUserIdFromToken(token);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/update/${userId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast("Bilgiler güncellendi!", "success");
                navigate("/anasayfa/profil");
            } else {
                showToast("Güncelleme başarısız", "error");
            }
        } catch (error) {
            showToast("Hata oluştu", "error");
        }
    };

    const handleDeleteAccount = async () => { 
        const onay = await showConfirm("Hesabını Sil", "Hesabını kalıcı olarak silmek istediğine emin misin?");
        if(onay) {
            showToast("Hesap silme işlemi henüz aktif değil.", "info");
        }
    };

    if (loading) return <div className="us-set-loading"><div className="spinner"></div>Yükleniyor...</div>;

    return (
        <div className="us-set-body"> 
            <div className="settings-container">
                <div className="settings-header">
                    <h1>Profil Ayarları</h1>
                    <Link to="/anasayfa/profil" className="back-link">← Profile Dön</Link>
                </div>

                <div className="avatar-section">
                    <div className="big-avatar">
                        {formData.Ad ? formData.Ad.charAt(0).toUpperCase() : "?"}
                    </div>
                    <h3 className="avatar-name">{formData.Ad} {formData.Soyad}</h3>
                    <span className="avatar-role">Kullanıcı</span>
                </div>

                <form onSubmit={handleSubmit} className="settings-form">
                    
                    <div className="form-group">
                        <label>Ad</label>
                        <input type="text" name="Ad" className="set-input" value={formData.Ad} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Soyad</label>
                        <input type="text" name="Soyad" className="set-input" value={formData.Soyad} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Kullanıcı Adı</label>
                        <input type="text" name="KullaniciAdi" className="set-input" value={formData.KullaniciAdi} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="Email" className="set-input" value={formData.Email} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Yeni Şifre <small>(Değiştirmek istemiyorsanız boş bırakın)</small></label>
                        <input type="password" name="Sifre" className="set-input" value={formData.Sifre} onChange={handleChange} placeholder="********" />
                    </div>

                    <div className="button-group">
                        <button type="button" onClick={() => navigate("/anasayfa/profil")} className="cancel-btn">İptal</button>
                        <button type="submit" className="save-btn">Kaydet</button>
                    </div>
                </form>

                <div className="danger-zone">
                    <div className="danger-text">
                        <h3>Hesabı Sil</h3>
                        <p>Bu işlem geri alınamaz.</p>
                    </div>
                    <button type="button" onClick={handleDeleteAccount} className="delete-account-btn">Hesabımı Sil</button>
                </div>

            </div>
        </div>
    );
}
export default UsPageSet;