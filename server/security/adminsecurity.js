const verifyAdmin = (req, res, next) => {
    // req.user, authMiddleware'den geliyor
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Bu işlem için Admin yetkisi gerekiyor!" });
    }
};

module.exports = verifyAdmin;
