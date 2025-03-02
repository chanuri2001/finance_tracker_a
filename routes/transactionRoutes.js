const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    addTransaction, 
    getTransactions, 
    filterTransactions, 
    updateTransaction, 
    deleteTransaction 
} = require('../controllers/transactionController');

router.post('/', protect, addTransaction);
router.get('/', protect, getTransactions);
router.get('/filter', protect, filterTransactions);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
