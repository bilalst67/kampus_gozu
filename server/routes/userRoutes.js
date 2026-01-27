const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const userController = require('../controllers/usController');
const verifyToken = require("../security/authVerify");
const verifyAdmin = require("../security/adminVerify");
const upload = require('../security/upload');

// === Public Endpoints ===
router.get('/public/users', userController.getPublicUserList);
router.get('/public/problems', problemController.getPublicProblems);
router.post('/newuser', userController.createUser);
router.post('/verify', userController.verifyEmail);
router.post('/login', userController.login);

// === Protected Endpoints (Token Required) ===
router.get('/user/problem/full', verifyToken, problemController.fullProblem);
router.get('/users/:id', verifyToken, userController.getUserById);
router.get('/user/:id', verifyToken, problemController.userreq);
router.get('/notifications/:userId', verifyToken, problemController.getUserNotifications);

// === User Actions ===
router.post('/user/newproblem', verifyToken, upload.single('Fotograf'), problemController.userCreateProblem);
router.post('/user/problem/support/:id', verifyToken, problemController.toggleSupport);
router.delete('/problem/delete/:id', verifyToken, problemController.userDeleteProblem);
router.put('/update/:id', verifyToken, userController.updateUser);
router.delete('/delete/:id', verifyToken, userController.deleteUser);

// === Admin Endpoints ===
router.get('/admin/problems', verifyToken, verifyAdmin, problemController.getAllProblemsForAdmin);
router.put('/admin/problem/status/:id', verifyToken, verifyAdmin, problemController.updateProblemStatus);
router.delete('/admin/problem/:id', verifyToken, verifyAdmin, problemController.deleteProblemAdmin);

module.exports = router;