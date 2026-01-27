export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        // Token yapısı: Header.Payload.Signature
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Türkçe karakter ve UTF-8 uyumluluğu için decode işlemi
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload);
        
        // exp saniye cinsindendir, Date.now() milisaniye.
        if (Date.now() >= exp * 1000) {
            return true;
        }
        
        return false;

    } catch (e) {
        return true; 
    }
};