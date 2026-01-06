const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require("../middleware/authmiddleware");
const verifyAdmin = require("../middleware/adminMiddleware"); // EKLENDİ

router.get('/users', verifyToken, userController.getUsers);
router.get('/users/:id', verifyToken, userController.getUserById);
router.post('/newuser', userController.createUser);
router.post('/login', userController.login);
router.put('/update/:id', verifyToken, userController.updateUser);

// SİLME İŞLEMİ: Hem giriş yapmış olmalı (Token) hem de Admin olmalı
router.delete('/delete/:id', verifyToken, verifyAdmin, userController.deleteUser);

module.exports = router;
