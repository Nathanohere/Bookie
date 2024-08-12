const Book = require('../models/bookModel');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/appError');
const handler = require('./controlHandler');

exports.getBooks = handler.getAll(Book);
exports.getBook = handler.getOne(Book, { path: 'reviews' });
exports.createBook = handler.createOne(Book);
exports.updateBook = handler.updateOne(Book);
exports.deleteBook = handler.deleteOne(Book);




// exports.getBook = asyncHandler(async (req, res, next) => {
//   const book = await Book.findById(req.params.id).populate('reviews');
//   if (!book) {
//     return next(new AppError('No tour exists with that Id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       book,
//     },
//   });
// });

// exports.deleteBook = asyncHandler(async (req, res) => {
//   const book = await Book.findByIdAndDelete(req.params.id);

//   if (!book) {
//     return next(new AppError('No tour exists with that Id', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
