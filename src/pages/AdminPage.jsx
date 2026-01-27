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

    const toggleRow = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleStatusChange = async (id, newStatus) => {
        const onay = await showConfirm("Durum Güncellenecek", `Bu sorunu '${newStatus}' olarak işaretlemek istiyor musunuz?`);
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
                showToast(`Durum güncellendi: ${newStatus}`, "success");
                setProblems(problems.map(p => p.SorunID === id ? { ...p, Durum: newStatus } : p));
            }
        } catch (error) {
            console.error(error);
            showToast("İşlem başarısız oldu.", "error");
        }
    };

    const handleDelete = async (id) => {
        const onay = await showConfirm("Silinecek", "Bu kayıt kalıcı olarak silinsin mi?");
        if (!onay) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/problem/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                showToast("Sorun başarıyla silindi.", "success");
                setProblems(prev => prev.filter(p => p.SorunID !== id));
            }
        } catch (error) {
            console.error("Silme hatası:", error);
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
                        <span className="admin-badge">Admin</span>
                    </div>
                </div>

                <div className="admin-tabs">
                    <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                        Bekleyenler ({pendingCount})
                    </button>
                    <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                        Tüm Kayıtlar
                    </button>
                </div>

                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{width: "50px"}}>Detay</th>
                                <th>ID</th>
                                <th>Görsel</th>
                                <th>Başlık</th>
                                <th>Kullanıcı</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProblems.length === 0 ? (
                                <tr><td colSpan="7" style={{textAlign:"center", padding:"20px"}}>Kayıt bulunamadı.</td></tr>
                            ) : (
                                filteredProblems.map((sorun) => (
                                    <>
                                        <tr key={sorun.SorunID} className={expandedRows[sorun.SorunID] ? "row-expanded" : ""}>
                                            <td style={{textAlign: "center"}}>
                                                <button className={`btn-toggle-row ${expandedRows[sorun.SorunID] ? 'open' : ''}`} onClick={() => toggleRow(sorun.SorunID)}>▶</button>
                                            </td>
                                            <td>#{sorun.SorunID}</td>
                                            <td>
                                                {sorun.FotografUrl ? (
                                                    <img 
                                                        src={
                                                            sorun.FotografUrl.startsWith('http') 
                                                                ? sorun.FotografUrl 
                                                                : `${import.meta.env.VITE_API_URL}${sorun.FotografUrl}`
                                                        }
                                                        alt="preview" className="table-img"
                                                    />
                                                ) : <span>-</span>}
                                            </td>
                                            <td>
                                                <strong>{sorun.Baslik}</strong>
                                                <p className="sub-text">{sorun.KonumMetni}</p>
                                            </td>
                                            <td>{sorun.AdSoyad}</td>
                                            <td><span className={`status-pill ${getStatusClass(sorun.Durum)}`}>{sorun.Durum}</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    {(sorun.Durum === 'Beklemede' || !sorun.Durum) && (
                                                        <button className="btn-approve" title="Onayla" onClick={() => handleStatusChange(sorun.SorunID, "Onaylandı")}>✅</button>
                                                    )}
                                                    {sorun.Durum === 'Onaylandı' && (
                                                        <button className="btn-solve" title="Çözüldü Olarak İşaretle" onClick={() => handleStatusChange(sorun.SorunID, "Çözüldü")}>🏆</button>
                                                    )}
                                                    {sorun.Durum !== 'Çözüldü' && (
                                                        <button className="btn-reject" title="Reddet ve Sil" onClick={() => handleDelete(sorun.SorunID)}>❌</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRows[sorun.SorunID] && (
                                            <tr className="detail-row">
                                                <td colSpan="7">
                                                    <div className="detail-content">
                                                        <p><strong>Açıklama:</strong> {sorun.Aciklama}</p>
                                                        <div className="meta-info">
                                                            <span>📅 {new Date(sorun.Tarih).toLocaleDateString('tr-TR')}</span>
                                                            <span>📍 {sorun.Latitude}, {sorun.Longitude}</span>
                                                            <span>📧 {sorun.Email}</span>
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