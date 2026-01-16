import { useState, useEffect } from "react";
import SelectionMap from "./companents/selectionMap"; // Klasör yolu düzeltildi
import { useNavigate, Link } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";
import { showToast } from "../utils/customAlert";
import "./css/newProblem.css";

function NewProblem() {
    const navigate = useNavigate();

    const [sorun, setSorun] = useState({
        Baslik: "",
        Aciklama: "",
        Latitude: null,
        Longitude: null,
        KonumMetni: "", 
        Fotograf: null
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        // 1. Token hiç yoksa? -> Giriş'e at
        if (!token) {
            navigate("/");
            return;
        }

        // 2. Token var ama süresi dolmuş mu? -> Temizle ve Giriş'e at
        if (isTokenExpired(token)) {
            showToast("Oturum süreniz doldu. Lütfen tekrar giriş yapın.", 'info');
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            navigate("/");
        }
    }, [navigate]); // navigate dependency eklendi

    const konumYakala = (lat, lng) => {
        setSorun({ ...sorun, Latitude: lat, Longitude: lng });
    };

    const handleChange = (e) => {
        setSorun({ ...sorun, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSorun({ ...sorun, Fotograf: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sorun.Latitude || !sorun.Longitude) {
            showToast("Lütfen haritadan bir konum seçiniz!", 'warning');
            return;
        }

        const formData = new FormData();
        formData.append("Baslik", sorun.Baslik);
        formData.append("Aciklama", sorun.Aciklama);
        formData.append("Latitude", sorun.Latitude);
        formData.append("Longitude", sorun.Longitude);
        formData.append("KonumMetni", sorun.KonumMetni);
        if (sorun.Fotograf) {
            formData.append("Fotograf", sorun.Fotograf);
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/newproblem`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                showToast("Sorun başarıyla bildirildi!", 'success');
                navigate("/anasayfa");
            } else {
                showToast("Bir hata oluştu.", 'error');
            }

        } catch (error) {
            console.error("Gönderme hatası:", error);
            showToast("Sunucuya bağlanılamadı.", "error");
        }
    };

    return (
        <div className="np-body">
            <div className="np-card">
                
                {/* Üst Başlık ve Geri Butonu */}
                <div className="np-header">
                    <Link to="/anasayfa" className="back-btn">← Geri</Link>
                    <h1>Yeni Sorun Bildir</h1>
                </div>

                <form onSubmit={handleSubmit} className="np-form">
                    
                    {/* 1. Başlık ve Konum Metni (Yan Yana) */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Sorun Başlığı</label>
                            <input 
                                className="np-input" 
                                type="text" 
                                name="Baslik"
                                placeholder="Örn: Kırık Bank" 
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Konum Tarifi</label>
                            <input 
                                className="np-input" 
                                type="text" 
                                name="KonumMetni"
                                placeholder="Örn: Kütüphane yanı" 
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Açıklama */}
                    <div className="form-group">
                        <label>Detaylı Açıklama</label>
                        <textarea 
                            className="np-textarea" 
                            name="Aciklama"
                            placeholder="Sorunu detaylıca anlatınız..." 
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    {/* 2. Harita Bölümü */}
                    <div className="map-section">
                        <label className="section-label">
                            Konumu İşaretle: 
                            {sorun.Latitude ? 
                                <span className="status-ok"> (Seçildi ✅)</span> : 
                                <span className="status-wait"> (Lütfen haritadan seçin 📍)</span>
                            }
                        </label>
                        <div className="map-wrapper">
                            <SelectionMap onKonumSec={konumYakala} />
                        </div>
                    </div>

                    {/* 3. Fotoğraf Yükleme */}
                    <div className="form-group file-group">
                        <label>Fotoğraf Ekle (Opsiyonel)</label>
                        <input 
                            type="file" 
                            className="file-input"
                            onChange={handleFileChange} 
                            accept="image/*" 
                        />
                    </div>

                    {/* 4. Gönder Butonu */}
                    <button className="np-button" type="submit">
                        BİLDİRİMİ GÖNDER 🚀
                    </button>

                </form>
            </div>
        </div>
    );
}

export default NewProblem;