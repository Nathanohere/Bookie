/*
const Cart = require('../models/cartModel');
const Book = require('../models/bookModel');
const AppError = require('../utils/appError');
const asyncHandler = require('express-async-handler');

exports.addToCart = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const { bookId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId: _id });
    const book = await Book.findOne({ _id: bookId });

    if (!book) {
      return next(new AppError('Book is not foud', 404));
    }
    const price = book.price;
    const title = book.title;
    //If cart already exists for user,
    if (cart) {
      const bookIndex = cart.books.findIndex((book) => book.bookId == bookId);
      //check if product exists or not

      if (bookIndex > -1) {
        let product = cart.items[bookIndex];
        product.quantity += quantity;

        cart.bill = cart.books.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);

        cart.books[bookIndex] = product;
        await cart.save();
        res.status(200).send(cart);
      } else {
        cart.books.push({ itemId, title, quantity, price });
        cart.bill = cart.books.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);

        await cart.save();
        res.status(200).json({
          status: 'success',
          cart,
        });
      }
    } else {
      //no cart exists, create one
      const newCart = await Cart.create({
        userId: _id,
        items: [{ itemId, title, quantity, price }],
        bill: quantity * price,
      });
      return res.status(200).json({
        status: 'success',
        newCart,
      });
    }
  } catch (error) {
    console.log(error);
    return next(new AppError('Something went wrong', 500));
  }
});

exports.getCart = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  if (!_id) {
    return next(new AppError('This is invalid', 400));
  }
  try {
    const cart = await Cart.findOne({ userId: _id });
    if (cart && cart.books.length > 0) {
      res.status(200).json({
        status: 'success',
        cart,
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    return next(new AppError('Something went wrong', 500));
  }
});

exports.emptyCart = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const { bookId } = req.query;
  try {
    let cart = await Cart.findOne({ userId: _id });

    const bookIndex = cart.books.findIndex((book) => book.bookId == bookId);

    if (bookIndex > -1) {
      let book = cart.books[bookIndex];
      cart.bill = book.quantity * book.price;
      if (cart.bill < 0) {
        cart.bill = 0;
      }
      cart.books.splice(bookIndex, 1);
      cart.bill = cart.books.reduce((acc, curr) => {
        return acc + curr.quantity * curr.price;
      }, 0);
      cart = await cart.save();

      res.status(200).json({
        status: 'success',
        cart,
      });
    }
  } catch (error) {
    return next(new AppError('Book not found', 400));
  }
});

*/