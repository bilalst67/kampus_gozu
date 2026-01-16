import { Link, useNavigate } from 'react-router-dom'
import './css/signin.css'
import { useState } from 'react'
import { showToast } from '../utils/customAlert';

function SignIn() {
    const navigate = useNavigate();
    const [newUser, setNewUser] = useState({ AdSoyad: "", Email: "", Sifre: "" })
    const [errors, setErrors] = useState({})

    // --- TEKİL ALAN DOĞRULAMA FONKSİYONU ---
    // Bu fonksiyon sadece kendisine gönderilen alanı (name) kontrol eder ve hata mesajı döndürür.
    const checkValidation = (name, value) => {
        let error = "";
        const cleanValue = value ? value.trim() : "";

        // Regex Tanımları
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*.?])/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        switch (name) {
            case "AdSoyad":
                if (!cleanValue) error = "Ad Soyad alanı boş bırakılamaz.";
                else if (cleanValue.length < 3) error = "Ad Soyad en az 3 karakter olmalıdır.";
                else if (cleanValue.length > 50) error = "Ad Soyad çok uzun.";
                break;

            case "Email":
                if (!cleanValue) {
                    error = "E-posta alanı boş bırakılamaz.";
                } else if (cleanValue.length > 100) {
                    error = "E-posta çok uzun.";
                } else if (!emailRegex.test(cleanValue)) {
                    error = "Lütfen geçerli bir e-posta adresi giriniz.";
                } else {
                    const parts = cleanValue.split('@');
                    if (parts.length === 2) {
                        const domain = parts[1].toLowerCase();
                        const allowedDomains = ['uludag.edu.tr', 'ogr.uludag.edu.tr', 'gmail.com'];
                        
                        if (domain.indexOf('.') === -1) {
                            error = "E-posta uzantısı eksik.";
                        } else if (!allowedDomains.includes(domain)) {
                            error = "Sadece üniversite veya Gmail adresi kabul edilmektedir.";
                        } else if (domain.includes('tempmail') || domain.includes('10minutemail')) {
                            error = "Geçici mail adresleri yasaktır.";
                        }
                    }
                }
                break;

            case "Sifre":
                if (!value) {
                    error = "Şifre alanı boş bırakılamaz.";
                } else if (value.length < 8) {
                    error = "Şifre en az 8 karakter olmalıdır.";
                } else if (value.length > 30) {
                    error = "Şifre çok uzun.";
                } else if (!passwordRegex.test(value)) {
                    let missing = [];
                    if (!/(?=.*[A-Z])/.test(value)) missing.push("1 Büyük Harf");
                    if (!/(?=.*[a-z])/.test(value)) missing.push("1 Küçük Harf");
                    if (!/(?=.*[0-9])/.test(value)) missing.push("1 Rakam");
                    if (!/(?=.*[!@#\$%\^&\*.?])/.test(value)) missing.push("1 Sembol (!@#$%.?)");
                    
                    error = `Eksikleriniz var: ${missing.join(", ")}`;
                }
                break;
                
            default:
                break;
        }

        return error;
    };

    // Input değiştiğinde (Hata varsa siler, kullanıcı düzeltiyor demektir)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });

        // Kullanıcı yazmaya başladığında hatayı kaldıralım ki rahatsız etmesin
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMsg = checkValidation(name, value);
        
        // Hata varsa state'e ekle, yoksa temizle
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: errorMsg
        }));
    };

    // Form Gönderilirken (Tüm alanları kontrol et)
    const validateFormOnSubmit = () => {
        const newErrors = {};
        let isValid = true;

        // Tüm alanları tek tek kontrol et
        Object.keys(newUser).forEach(key => {
            const error = checkValidation(key, newUser[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const sigin = async (e) => {
        e.preventDefault();
        
        if (!validateFormOnSubmit()) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newuser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });

            const result = await response.json();

            if (response.ok) {
                showToast("Hoş geldiniz, şimdi giriş yapabilirsiniz.", 'success');
                navigate("/login"); 
            } else {
                showToast("Hata: " + (result.message || "Kayıt başarısız."), 'error');
            }
        } catch (error) {
            console.log(error);
            showToast("Sunucu bağlantı hatası!", 'error');
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
                            onBlur={handleBlur}
                        />
                        {errors.AdSoyad && <small className="error-text">⚠️ {errors.AdSoyad}</small>}
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
                            onBlur={handleBlur}
                        />
                        {errors.Email && <small className="error-text">⚠️ {errors.Email}</small>}
                    </div>

                    {/* Şifre */}
                    <div className='input-group'>
                        <input
                            className={`signinInput ${errors.Sifre ? 'input-error' : ''}`}
                            type="password"
                            name="Sifre"
                            placeholder="Şifreniz"
                            value={newUser.Sifre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.Sifre && <small className="error-text" style={{color: '#dc3545'}}>⚠️ {errors.Sifre}</small>}
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