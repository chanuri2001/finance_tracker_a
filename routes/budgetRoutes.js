const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    setBudget, 
    getBudgets, 
    updateBudget, 
    deleteBudget, 
    budgetAlerts, 
    budgetRecommendations 
} = require('../controllers/budgetController');

router.post('/', protect, setBudget);
router.get('/', protect, getBudgets);
router.put('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);
router.get('/alerts', protect, budgetAlerts);  // ✅ Added
router.get('/recommendations', protect, budgetRecommendations);  // ✅ Added

module.exports = router;
