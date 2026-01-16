import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./css/login.css";
import { showToast } from "../utils/customAlert";

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
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
                    
                    <div className="input-group">
                        <input
                            className="loginInput"
                            type="password"
                            placeholder="Şifreniz"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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