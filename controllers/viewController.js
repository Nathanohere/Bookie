const Book = require('../models/bookModel');
const Cart = require('../models/cartModel');
const AppError = require('../utils/appError');
const asyncHandler = require('express-async-handler');

exports.getOverview = asyncHandler(async (req, res, next) => {
  const books = await Book.find();
  // console.log(books);
  res.status(200).render('views/overview', {
    title: 'All books',
    books,
  });
});

exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!book) {
    return next(new AppError('No book available with that name.', 404));
  }

  res.status(200).render('views/book', {
    title: 'Code Dojo',
    book,
  });
});

exports.getLoginForm = asyncHandler((req, res) => {
  res.status(200).render('views/form/login', {
    title: 'Log into your account',
  });
});

exports.getSignupForm = asyncHandler(async (req, res) => {
  const books = await Book.find();
  res.status(200).render('views/form/signup', {
    title: 'Sign up',
    books,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('views/account', {
    title: 'Your account',
  });
};

exports.getForgotPasswordForm = asyncHandler((req, res) => {
  res.status(200).render('views/form/forgotPassword', {
    title: 'Forgot your Password',
  });
});

exports.getResetPasswordForm = asyncHandler((req, res) => {
  const token = req.params.token;
  res.status(200).render('views/form/resetPassword', {
    title: 'Forgot your Password',
    token,
  });
});

// exports.getCart = asyncHandler(async (req, res, next) => {
//   const { bookId } = req.body;

//   const book = await Book.findOne({ _id: bookId });
//   console.log(book);
//   if (!book) {
//     return next(new AppError('No books found.', 404));
//   }
//   res.status(200).render('views/cart', {
//     title: 'Get cart',
//     book,
//   });
// });
// exports.updateUser = async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   res.status(200).render('views/account', {
//     title: 'Your account',
//     user: updatedUser,
//   });
//   console.log('reka', req.user.id);
// };
