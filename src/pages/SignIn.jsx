import { Link, useNavigate } from 'react-router-dom'
import './css/signin.css'
import { useState } from 'react'
import { showToast } from '../utils/customAlert';

function SignIn() {
    const navigate = useNavigate();
    const [newUser, setNewUser] = useState({ 
        Ad: "", 
        Soyad: "", 
        KullaniciAdi: "", 
        Email: "", 
        Sifre: "" 
    });
    const [errors, setErrors] = useState({})

    const checkValidation = (name, value) => {
        let error = "";
        const cleanValue = value ? value.trim() : "";
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*.?])/;
        const schoolEmailRegex = /^[a-zA-Z0-9._%+-]+@(ogr\.uludag\.edu\.tr|uludag\.edu\.tr)$/;

        switch (name) {
            case "Ad":
                if (cleanValue.length < 2) error = "Ad en az 2 karakter olmalı.";
                break;
            case "Soyad":
                if (cleanValue.length < 2) error = "Soyad en az 2 karakter olmalı.";
                break;
            case "KullaniciAdi":
                if (cleanValue.length < 3) error = "Kullanıcı adı en az 3 karakter olmalı.";
                break;
            case "Email":
                if (!cleanValue) {
                    error = "E-posta boş olamaz.";
                } else if (!schoolEmailRegex.test(cleanValue)) {
                    error = "Sadece '@uludag.edu.tr' veya '@ogr.uludag.edu.tr' uzantılı mailler kabul edilir.";
                }
                break;
            case "Sifre":
                if (value.length < 8) error = "Şifre en az 8 karakter olmalı.";
                else if (!passwordRegex.test(value)) error = "Şifre zayıf (Büyük harf, sayı, sembol).";
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMsg = checkValidation(name, value);
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const sigin = async (e) => {
        e.preventDefault();
        const formErrors = {};
        Object.keys(newUser).forEach(key => {
            const error = checkValidation(key, newUser[key]);
            if (error) formErrors[key] = error;
        });

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            showToast("Lütfen formu kurallara uygun doldurun.", "warning");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newuser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });

            const result = await response.json();

            if (response.ok) {
                showToast("Kayıt Başarılı! Doğrulama kodu gönderildi.", 'success');
                navigate(`/verify?email=${newUser.Email}`); 
            } else {
                showToast("Hata: " + (result.message || "Kayıt başarısız."), 'error');
            }
        } catch (error) {
            showToast("Sunucu bağlantı hatası!", 'error');
        }
    }

    return (
        <div className="signinBody">
            <div className="signinCard">
                <h1 className="signinBaslik">Kampüs Gözü</h1>
                <p className="signinAltBaslik">Aramıza Katılın</p>
                <form onSubmit={sigin} noValidate>
                    
                    <div className='input-group'>
                        <input className="signinInput" type="text" name="Ad" placeholder="Adınız" value={newUser.Ad} onChange={handleChange} onBlur={handleBlur} />
                        {errors.Ad && <small className="error-text">{errors.Ad}</small>}
                    </div>

                    <div className='input-group'>
                        <input className="signinInput" type="text" name="Soyad" placeholder="Soyadınız" value={newUser.Soyad} onChange={handleChange} onBlur={handleBlur} />
                        {errors.Soyad && <small className="error-text">{errors.Soyad}</small>}
                    </div>

                    <div className='input-group'>
                        <input className="signinInput" type="text" name="KullaniciAdi" placeholder="Kullanıcı Adı" value={newUser.KullaniciAdi} onChange={handleChange} onBlur={handleBlur} />
                        {errors.KullaniciAdi && <small className="error-text">{errors.KullaniciAdi}</small>}
                    </div>

                    <div className='input-group'>
                        <input className="signinInput" type="email" name="Email" placeholder="Email (ogr.uludag.edu.tr)" value={newUser.Email} onChange={handleChange} onBlur={handleBlur} />
                        {errors.Email && <small className="error-text">{errors.Email}</small>}
                    </div>

                    <div className='input-group'>
                        <input className="signinInput" type="password" name="Sifre" placeholder="Şifre" value={newUser.Sifre} onChange={handleChange} onBlur={handleBlur} />
                        {errors.Sifre && <small className="error-text">{errors.Sifre}</small>}
                    </div>

                    <button type='submit' className='signinButton'>KAYIT OL</button>
                    
                    <div className="signinFooter">
                        <Link className="signinLink" to='/login'>Zaten hesabınız var mı? Giriş Yapın</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default SignIn