const Review = require('../models/reviewModel');
const handler = require('./controlHandler');

exports.setBookUserId = (req, res, next) => {
  // Allow nested routes
  if (!req.body.book) req.body.book = req.params.bookId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getAllReviews = handler.getAll(Review);
exports.getReview = handler.getOne(Review);
exports.createReview = handler.createOne(Review);
exports.updateReview = handler.updateOne(Review);
exports.deleteReview = handler.deleteOne(Review);
