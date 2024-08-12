const express = require('express');
const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');
const router = express.Router();

// router.get('/addToCart', bookController.addToCart);
// router.post('/addToCart', authController.addToCart);
// router.get('/getCart', authController.getCart);
// router.delete('/emptyCart', authController.emptyCart);

module.exports = router;
