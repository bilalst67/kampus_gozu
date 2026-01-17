import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./css/login.css";
import { showToast } from "../utils/customAlert";

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    
    // Şifre görünürlüğünü kontrol eden state
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        
        if(!email || !password) {
            showToast("Lütfen tüm alanları doldurunuz.",'info');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Email: email, Sifre: password })
            })

            const data = await response.json() 

            if (response.ok) {
                localStorage.setItem("token", data.token)
                localStorage.setItem("userRole", data.user.Rol) 
                navigate("/anasayfa")
            } else {
                showToast(data.message || "Giriş başarısız!",'warning');
            }
        } catch (err) {
            console.error("Hata oluştu: " + err)
            showToast("Sunucuya bağlanılamadı!",'error');
        }
    }

    // Şifre göster/gizle fonksiyonu
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="loginBody">
            <div className="loginCard">
                <h1 className="loginBaslik">Kampüs Gözü</h1>
                <p className="loginAltBaslik">Giriş Yap</p>
                
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <input
                            className="loginInput"
                            type="email"
                            placeholder="Email Adresiniz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* Şifre Alanı Düzenlendi */}
                    <div className="input-group password-group">
                        <input
                            className="loginInput"
                            // State true ise text (görünür), false ise password (gizli)
                            type={showPassword ? "text" : "password"}
                            placeholder="Şifreniz"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        
                        {/* Göz İkonu */}
                        <span 
                            className="password-toggle-icon" 
                            onClick={togglePasswordVisibility}
                            title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                        >
                            {showPassword ? (
                                // Göz Açık İkonu (Şifre Görünürken - Gizlemek için)
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            ) : (
                                // Göz Kapalı/Çizgili İkonu (Şifre Gizliyken - Göstermek için)
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            )}
                        </span>
                    </div>
                    
                    <button 
                        className="loginButton"
                        type="submit"
                    >
                        GİRİŞ YAP
                    </button>

                    <div className="loginFooter">
                        <span className="loginRegText">Hesabınız yoksa?</span>
                        <Link className="loginLink" to='/signin'>
                            Kayıt Olun
                        </Link>        
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login