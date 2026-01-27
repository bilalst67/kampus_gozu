const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Bu işlem için yönetici yetkisi gerekmektedir." });
    }
};

module.exports = verifyAdmin;