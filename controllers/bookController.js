const Book = require('../models/bookModel');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/appError');
const handler = require('./controlHandler');

exports.getBooks = handler.getAll(Book);
exports.getBook = handler.getOne(Book, { path: 'reviews' });
exports.createBook = handler.createOne(Book);
exports.updateBook = handler.updateOne(Book);
exports.deleteBook = handler.deleteOne(Book);


