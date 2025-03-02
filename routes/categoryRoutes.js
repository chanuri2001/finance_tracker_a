const express = require('express');
const router = express.Router();
const { addCategory, getCategories } = require('../controllers/categoryController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, addCategory);
router.get('/', protect, getCategories);

module.exports = router;
