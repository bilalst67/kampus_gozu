import { Link, useNavigate } from 'react-router-dom'
import './css/signin.css'
import { useState } from 'react'
import { showToast } from '../utils/customAlert';

function SignIn() {
    const navigate = useNavigate();
    const [newUser, setNewUser] = useState({ AdSoyad: "", Email: "", Sifre: "" })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value
        });
        // Kullanıcı yazmaya başladığında hatayı silebiliriz (İsteğe bağlı)
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Regex tanımları
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*.])/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // --- AD SOYAD KONTROLÜ ---
        const cleanAdSoyad = newUser.AdSoyad ? newUser.AdSoyad.trim() : "";
        if (!cleanAdSoyad) {
            newErrors.AdSoyad = "Ad Soyad alanı boş bırakılamaz";
        } else if (cleanAdSoyad.length < 3) {
            newErrors.AdSoyad = "Ad Soyad en az 3 karakter olmalıdır";
        } else if (cleanAdSoyad.length > 50) {
            newErrors.AdSoyad = "Ad Soyad en fazla 50 karakter olabilir";
        }

        // --- EMAIL KONTROLÜ (GÜNCELLENDİ) ---
        const cleanEmail = newUser.Email ? newUser.Email.trim() : "";

        if (!cleanEmail) {
            newErrors.Email = "E-posta alanı boş bırakılamaz";
        } else if (cleanEmail.length > 100) {
            newErrors.Email = "E-posta en fazla 100 karakter olabilir";
        } else if (!emailRegex.test(cleanEmail)) {
            newErrors.Email = "Lütfen geçerli bir e-posta adresi giriniz";
        } else {
            // EĞER FORMAT GEÇERLİYSE, @ SONRASINI DETAYLI KONTROL ET
            const parts = cleanEmail.split('@'); // @ işaretinden ikiye böl
            if (parts.length === 2) {
                const domain = parts[1].toLowerCase(); // @'den sonraki kısım (örn: gmail.com)
                // SENARYO 1: Uzantı kontrolü (Nokta var mı ve en az 2 harf mi?)
                if (domain.indexOf('.') === -1) {
                    newErrors.Email = "E-posta adresinin uzantısı (örn: .com) eksik!";
                }
                // SENARYO 2: (İsteğe Bağlı) Sadece Kurumsal/Üniversite maili olsun istersen:
                const allowedDomains = ['uludag.edu.tr', 'ogr.uludag.edu.tr', 'gmail.com'];
                if (!allowedDomains.includes(domain)) {
                     newErrors.Email = "Sadece üniversite veya Gmail adresi ile kayıt olabilirsiniz!";
                }
                // SENARYO 3: (İsteğe Bağlı) Geçici mailleri engellemek istersen:
                if (domain.includes('tempmail') || domain.includes('10minutemail')) {
                    newErrors.Email = "Geçici mail adresleri kabul edilmemektedir.";
                }
                
            }
        }

        // --- ŞİFRE KONTROLÜ ---
        if (!newUser.Sifre) {
            newErrors.Sifre = "Şifre alanı boş bırakılamaz";
        } else if (newUser.Sifre.length < 8) {
            newErrors.Sifre = "Şifre en az 8 karakter olmalıdır";
        } else if (newUser.Sifre.length > 30) {
            newErrors.Sifre = "Şifre en fazla 30 karakter olabilir";
        } else if (!passwordRegex.test(newUser.Sifre)) {
            newErrors.Sifre = "Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter (!@#$%.) içermelidir";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sigin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newuser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });

            const result = await response.json();

            if (response.ok) {
                showToast("Hoş geldiniz, şimdi giriş yapabilirsiniz.");
                navigate("/login"); 
            } else {
                showToast("Hata: " + (result.message || "Kayıt başarısız.",'error'));
            }
        } catch (error) {
            console.log(error);
            showToast("Sunucu bağlantı hatası!",'error');
        }
    }

    return (
        <div className="signinBody">
            <div className="signinCard">
                <h1 className="signinBaslik">Kampüs Gözü</h1>
                <p className="signinAltBaslik">Aramıza Katılın</p>
                
                <form onSubmit={sigin} noValidate>
                    
                    {/* Ad Soyad */}
                    <div className='input-group'>
                        <input
                            className={`signinInput ${errors.AdSoyad ? 'input-error' : ''}`}
                            type="text"
                            name="AdSoyad"
                            placeholder="Adınız Soyadınız"
                            value={newUser.AdSoyad}
                            onChange={handleChange}
                        />
                        {errors.AdSoyad && <small className="error-text">{errors.AdSoyad}</small>}
                    </div>

                    {/* Email */}
                    <div className='input-group'>
                        <input
                            className={`signinInput ${errors.Email ? 'input-error' : ''}`}
                            type="email"
                            name="Email"
                            placeholder="Email Adresiniz"
                            value={newUser.Email}
                            onChange={handleChange}
                        />
                        {errors.Email && <small className="error-text">{errors.Email}</small>}
                    </div>

                    {/* Şifre */}
                    <div className='input-group'>
                        <input
                            className={`signinInput ${errors.Sifre ? 'input-error' : ''}`}
                            type="password"
                            name="Sifre"
                            placeholder="Şifreniz (En az 6 karakter)"
                            value={newUser.Sifre}
                            onChange={handleChange}
                        />
                        {errors.Sifre && <small className="error-text">{errors.Sifre}</small>}
                    </div>

                    <button type='submit' className='signinButton'>KAYIT OL</button>

                    <div className="signinFooter">
                        <span className="signinRegText">Zaten hesabınız var mı?</span>
                        <Link className="signinLink" to='/login'>Giriş Yapın</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default SignIn