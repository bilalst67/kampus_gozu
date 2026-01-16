import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast, showConfirm } from "../utils/customAlert";
import { isTokenExpired } from "../utils/auth";
import "./css/adminPage.css";

function AdminPage() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    
    const [expandedRows, setExpandedRows] = useState({});

    const navigate = useNavigate();

    const fetchAdminData = async () => {
        const token = localStorage.getItem("token");
        if (!token || isTokenExpired(token)) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/problems`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Yetkisiz Erişim");
            
            const data = await response.json();
            setProblems(data);
            setLoading(false);
        } catch (error) {
            showToast("Admin verileri alınamadı!", "error");
            navigate("/anasayfa");
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    // Satır aç/kapa fonksiyonu
    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id] // Varsa tersine çevir, yoksa true yap
        }));
    };

    const handleStatusChange = async (id, newStatus) => {
        const onay = await showConfirm(
            "Durum Güncellenecek",
            `Bu sorunu '${newStatus}' olarak işaretlemek istiyor musunuz?`
        );

        if (!onay) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/problem/status/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ Durum: newStatus })
            });

            if (response.ok) {
                showToast(`Durum: ${newStatus}`, "success");
                setProblems(problems.map(p => 
                    p.SorunID === id ? { ...p, Durum: newStatus } : p
                ));
            } else {
                showToast("Güncelleme başarısız.", "error");
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handleDelete = async (id) => {
        const onay = await showConfirm(
            "Sorun Reddedilecek ve Silinecek",
            "Bu işlem geri alınamaz. Sorunu kalıcı olarak silmek istediğinize emin misiniz?"
        );

        if (!onay) return;

        try {
            const token = localStorage.getItem("token");
            // DELETE isteği atıyoruz
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/problem/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                showToast("Sorun reddedildi ve silindi.", "success");
                
                // Listeden silinen elemanı çıkar (Sayfayı yenilemeye gerek kalmaz)
                setProblems(prevProblems => prevProblems.filter(p => p.SorunID !== id));
            } else {
                showToast("Silme işlemi başarısız.", "error");
            }
        } catch (error) {
            console.error("Silme hatası:", error);
            showToast("Sunucu hatası oluştu.", "error");
        }
    };

    const filteredProblems = activeTab === "pending" 
        ? problems.filter(p => p.Durum === "Beklemede" || p.Durum === "Onay Bekliyor" || !p.Durum)
        : problems;

    const pendingCount = problems.filter(p => p.Durum === 'Beklemede' || p.Durum === 'Onay Bekliyor' || !p.Durum).length;

    if (loading) return <div className="admin-loading">Yükleniyor...</div>;

    return (
        <div className="admin-body">
            <div className="admin-container">
                
                <div className="admin-header">
                    <h1>Yönetim Paneli</h1>
                    <div className="header-actions">
                        <Link to="/anasayfa" className="back-link">← Siteye Dön</Link>
                        <span className="admin-badge">Admin Yetkisi</span>
                    </div>
                </div>

                <div className="admin-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Bekleyen Onaylar ({pendingCount})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Tüm Kayıtlar
                    </button>
                </div>

                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{width: "50px"}}>Detay</th> {/* Açma butonu için sütun */}
                                <th>ID</th>
                                <th>Görsel</th>
                                <th>Başlık / Konum</th>
                                <th>Kullanıcı</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProblems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{textAlign:"center", padding:"20px"}}>
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredProblems.map((sorun) => (
                                    <>
                                        {/* ANA SATIR */}
                                        <tr key={sorun.SorunID} className={expandedRows[sorun.SorunID] ? "row-expanded" : ""}>
                                            <td style={{textAlign: "center"}}>
                                                <button 
                                                    className={`btn-toggle-row ${expandedRows[sorun.SorunID] ? 'open' : ''}`}
                                                    onClick={() => toggleRow(sorun.SorunID)}
                                                >
                                                    ▶
                                                </button>
                                            </td>
                                            <td>#{sorun.SorunID}</td>
                                            <td>
                                                {sorun.FotografUrl ? (
                                                    <img 
                                                        src={
                                                                sorun.FotografUrl.startsWith('http') 
                                                                    ? sorun.FotografUrl  // Eğer link http ile başlıyorsa (Cloudinary), olduğu gibi koy.
                                                                    : `${import.meta.env.VITE_API_URL}${sorun.FotografUrl}` // Değilse sunucu adresini ekle.
                                                            }
                                                        alt="thumb" 
                                                        className="table-img"
                                                    />
                                                ) : (
                                                    <span className="no-img">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <strong>{sorun.Baslik}</strong>
                                                <p className="sub-text">{sorun.KonumMetni}</p>
                                            </td>
                                            <td>
                                                {sorun.AdSoyad}
                                                <p className="sub-text">{sorun.Email}</p>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${getStatusClass(sorun.Durum)}`}>
                                                    {sorun.Durum || 'Beklemede'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {/* Onayla Butonu: Durum Beklemede, Onay Bekliyor veya Boş ise göster */}
                                                    {(sorun.Durum === 'Beklemede' || sorun.Durum === 'Onay Bekliyor' || !sorun.Durum) && (
                                                        <button 
                                                            className="btn-approve"
                                                            onClick={() => handleStatusChange(sorun.SorunID, "Onaylandı")}
                                                            title="Onayla"
                                                        >
                                                            ✅ Onayla
                                                        </button>
                                                    )}

                                                    {sorun.Durum === 'Onaylandı' && (
                                                        <button 
                                                            className="btn-solve"
                                                            onClick={() => handleStatusChange(sorun.SorunID, "Çözüldü")}
                                                            title="Çözüldü"
                                                        >
                                                            🏆 Çözüldü
                                                        </button>
                                                    )}
                                                    
                                                    {sorun.Durum !== 'Çözüldü' && (
                                                        <button 
                                                            className="btn-reject"
                                                            onClick={() => handleDelete(sorun.SorunID)}
                                                            title="Reddet ve Sil"
                                                        >
                                                            ❌ Reddet
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* DETAY SATIRI (Sadece butona basıldıysa görünür) */}
                                        {expandedRows[sorun.SorunID] && (
                                            <tr className="detail-row">
                                                <td colSpan="7">
                                                    <div className="detail-content">
                                                        <div className="detail-info">
                                                            <h4>📌 Sorun Açıklaması</h4>
                                                            <p>{sorun.Aciklama || "Açıklama girilmemiş."}</p>
                                                            
                                                            <div className="meta-info">
                                                                <span><strong>📅 Tarih:</strong> {new Date(sorun.Tarih).toLocaleDateString('tr-TR')}</span>
                                                                <span><strong>👍 Destek Sayısı:</strong> {sorun.DestekSayisi}</span>
                                                                <span><strong>📍 Koordinat:</strong> {sorun.Latitude}, {sorun.Longitude}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function getStatusClass(status) {
    switch (status) {
        case 'Onaylandı': return 'status-approved';
        case 'Çözüldü': return 'status-solved';
        case 'Reddedildi': return 'status-rejected';
        default: return 'status-pending';
    }
}

export default AdminPage;