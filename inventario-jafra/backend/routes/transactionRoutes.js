const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, transactionController.registerTransaction);

module.exports = router;