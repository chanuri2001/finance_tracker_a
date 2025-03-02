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
} = require('../controllers/budgetController'); // ✅ Ensure all functions are imported

router.post('/', protect, setBudget);
router.get('/', protect, getBudgets);
router.put('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);
router.get('/alerts', protect, budgetAlerts);
router.get('/recommendations', protect, budgetRecommendations);

module.exports = router;
