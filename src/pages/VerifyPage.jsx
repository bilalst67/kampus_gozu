import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showToast } from "../utils/customAlert";
import "./css/verifyPage.css"; 

function VerifyPage() {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [code, setCode] = useState("");
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Email: email, Code: code })
            });

            const data = await response.json();

            if (response.ok) {
                showToast("Hesabınız doğrulandı! Giriş yapabilirsiniz.", "success");
                navigate("/login");
            } else {
                showToast(data.message, "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Sunucu hatası", "error");
        }
    };

    return (
        <div className="verify-body">
            <div className="verify-card">
                <h1>Doğrulama</h1>
                <p>E-postanıza gelen 6 haneli kodu giriniz.</p>
                
                <form onSubmit={handleVerify}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email Adresiniz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            readOnly={!!searchParams.get("email")}
                        />
                    </div>
                    
                    <div className="input-group">
                        <input
                            className="code-input"
                            type="text"
                            placeholder="KOD"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength="6"
                            required
                        />
                    </div>
                    
                    <button className="verify-btn" type="submit">DOĞRULA</button>
                </form>
            </div>
        </div>
    );
}

export default VerifyPage;