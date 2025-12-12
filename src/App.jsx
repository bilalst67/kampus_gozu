import React, { useState, useEffect } from 'react';
import './App.css'

function App() {
  // --- DURUMLAR (STATE) ---
  // Kullanıcı giriş yaptı mı? (Başlangıçta null yani yok)
  const [user, setUser] = useState(null);
  
  // Şu an hangi ekrandayız? (true: Giriş, false: Kayıt Ol)
  const [girisModu, setGirisModu] = useState(true);

  // Form verileri
  const [formData, setFormData] = useState({ adsoyad: '', email: '', sifre: '' });
  const [hata, setHata] = useState(''); // Ekrana kırmızı yazı basmak için

  // --- 1. KAYIT OLMA FONKSİYONU ---
  const kayitOl = async (e) => {
    e.preventDefault(); // Sayfa yenilenmesin
    setHata('');

    // Backend'deki (api/auth.js) garsona siparişi veriyoruz
    const response = await fetch('/api/auth?islem=kayit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      alert("Kayıt Başarılı! Şimdi giriş yapabilirsin.");
      setGirisModu(true); // Giriş ekranına at
    } else {
      setHata(data.error); // "Sadece ogr.uludag..." hatasını burada gösterir
    }
  };

  // --- 2. GİRİŞ YAPMA FONKSİYONU ---
  const girisYap = async (e) => {
    e.preventDefault();
    setHata('');

    const response = await fetch('/api/auth?islem=giris', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email, sifre: formData.sifre })
    });

    const data = await response.json();

    if (data.success) {
      setUser(data.user); // İçeri al! Artık user dolu.
    } else {
      setHata(data.error);
    }
  };

  // --- 3. EKRAN ÇİZİMİ ---
  
  // EĞER KULLANICI GİRİŞ YAPTIYSA -> ANA SAYFAYI GÖSTER
  if (user) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Hoşgeldin, {user.ad} 👋</h1>
        <p>Burası Kampüs Gözü Ana Sayfası</p>
        <button onClick={() => setUser(null)} style={{ background: 'red', color: 'white', padding: '10px' }}>
          Çıkış Yap
        </button>
        {/* BURAYA SONRA HARİTA VE LİSTE GELECEK */}
      </div>
    );
  }

  // EĞER GİRİŞ YAPMADIYSA -> FORM GÖSTER
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#004f9f' }}>
          {girisModu ? 'Giriş Yap' : 'Öğrenci Kaydı'}
        </h2>

        {hata && <div style={{ color: 'red', marginBottom: '10px' }}>⚠️ {hata}</div>}

        <form onSubmit={girisModu ? girisYap : kayitOl}>
          
          {/* Sadece Kayıt modundaysak İsim sor */}
          {!girisModu && (
            <input 
              type="text" placeholder="Ad Soyad" required
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              onChange={(e) => setFormData({...formData, adsoyad: e.target.value})}
            />
          )}

          <input 
            type="email" placeholder="Okul Maili (@ogr.uludag.edu.tr)" required
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <input 
            type="password" placeholder="Şifre" required
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            onChange={(e) => setFormData({...formData, sifre: e.target.value})}
          />

          <button type="submit" style={{ width: '100%', padding: '10px', background: '#004f9f', color: 'white', border: 'none', cursor: 'pointer' }}>
            {girisModu ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          {girisModu ? "Hesabın yok mu?" : "Zaten üye misin?"} <br/>
          <span 
            onClick={() => { setGirisModu(!girisModu); setHata(''); }} 
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {girisModu ? "Kayıt Ol" : "Giriş Yap"}
          </span>
        </p>

      </div>
    </div>
  );
}

export default App;