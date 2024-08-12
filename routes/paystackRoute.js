const express = require('express');
const router = express.Router();

const paystackController = require('../controllers/paystackController');

router
  .route('/')
  .post(paystackController.acceptPayment)
  .get(paystackController.statusPayment);

module.exports = router;
