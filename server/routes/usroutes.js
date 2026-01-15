const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemcontroller')
const userController = require('../controllers/userController');
const verifyToken = require("../security/authmiddleware");
const verifyAdmin = require("../security/adminMiddleware");
const upload = require('../security/upload');

// Public Rotalar (Herkes Erişebilir)
router.get('/public/users', userController.getPublicUserList);
router.get('/public/problems',problemController.getPublicProblems)
router.post('/newuser', userController.createUser);
router.post('/login', userController.login);

// Korumalı Rotalar (Sadece Giriş Yapanlar)
router.get('/user/problem/full', verifyToken,problemController.fullProblem);
router.get('/users', verifyToken, userController.getUsers);
router.get('/users/:id', verifyToken, userController.getUserById);
router.get('/user/:id', verifyToken, problemController.userreq);
router.get('/notifications/:userId', verifyToken, problemController.getUserNotifications);
router.get('/admin/problems', verifyToken, verifyAdmin, problemController.getAllProblemsForAdmin);

// Sorun işlemleri
router.post('/user/newproblem', verifyToken, upload.single('Fotograf'), problemController.userCreateProblem);
router.post('/user/problem/support/:id', verifyToken, problemController.toggleSupport);
router.delete('/problem/delete/:id', verifyToken, problemController.userDeleteProblem);

// Kullanıcı Güncelleme ve Silme
router.put('/update/:id', verifyToken, userController.updateUser);
router.put('/admin/problem/status/:id', verifyToken, verifyAdmin, problemController.updateProblemStatus);
router.delete('/delete/:id', verifyToken, verifyAdmin, userController.deleteUser);
router.delete('/admin/problem/:id',verifyToken,verifyAdmin,problemController.deleteProblemAdmin)

module.exports = router;
