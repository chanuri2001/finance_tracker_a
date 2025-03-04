const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    login, 
    getProfile, 
    getAllUsers, 
    updateUserRole, 
    deleteUser 
} = require('../controllers/userController'); // ✅ Ensure all functions exist

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', login);
router.get('/me', protect, getProfile);


// ✅ Admin Routes
router.get('/all-users', protect, adminOnly, getAllUsers);
router.put('/update-role/:id', protect, adminOnly, updateUserRole);
router.delete('/delete/:id', protect, adminOnly, deleteUser);

module.exports = router;
