// src/utils/auth.js

export const isTokenExpired = (token) => {
    if (!token) return true; // Token yoksa zaten süresi bitmiştir :)

    try {
        // Token 3 parçadır (aaa.bbb.ccc). Ortadaki parça (payload) verileri tutar.
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload);
        
        // exp saniye cinsindendir, Date.now() milisaniye. 1000 ile çarpıyoruz.
        if (Date.now() >= exp * 1000) {
            return true; // Süresi Bitmiş
        }
        
        return false; // Hala Geçerli

    } catch (e) {
        return true; // Token bozuksa da bitmiş sayalım
    }
};