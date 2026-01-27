const errorHandler = (err, req, res, next) => {
    console.error("🔥 HATA:", err.stack);

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Sunucu tarafında beklenmedik bir hata oluştu.",
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;