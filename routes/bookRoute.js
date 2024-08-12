const express = require('express');
const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');
const router = express.Router();

router.use('/:bookId/reviews', reviewRouter);

router
  .route('/')
  .get(bookController.getBooks)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    bookController.createBook
  );

router
  .route('/:id')
  .get(bookController.getBook)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    bookController.updateBook
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    bookController.deleteBook
  );

// router
//   .route('/:bookId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );
module.exports = router;
