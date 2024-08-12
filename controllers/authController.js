const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Book = require('../models/bookModel');
const Cart = require('../models/cartModel');
const Email = require('../utils/emails');
const expressAsyncHandler = require('express-async-handler');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // seure: true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = asyncHandler(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    // passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;

  // console.log(url);
  // console.log(newUser);

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password exist
  if (!email && !password) {
    return next(
      new AppError('Please provide an email address and password', 400)
    );
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // IF everything ok send token to user
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = asyncHandler(async (req, res, next) => {
  // Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to gain access', 401)
    );
  }

  // Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // Check if user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token does not exist', 401)
    );
  }
  console.log(decoded.iat);
  // Check if password has been changed since token issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again', 401)
    );
  }
  // Grant access to protected routes
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1)Verify tokens
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) CHeck if user exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user hs changed password since issuing of token
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log('restrict', req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('The user is not authorized to perform the action')
      );
    }
    next();
  };

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Get user based on email
  const user = await User.findOne({ email: req.body.email });
  console.log(user);

  if (!user) {
    return next(new AppError('NO user with this email was found', 404));
  }

  // Generate random password
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(resetToken);

  // Send to user's email
  // const resetUrl = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordExpiresAt = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later', 500)
    );
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get user from token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log('hsh', hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordExpiresAt: { $gte: Date.now() },
  });

  console.log('usss', user);
  // If user exists and token is not expired, set new password
  if (!user) {
    return next(new AppError('Token is expired or is invalid', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  console.log('yoyoi', user.password, user.passwordConfirm);
  console.log('yoyoixc', req.body);

  user.passwordResetToken = undefined;
  user.passwordExpiresAt = undefined;

  await user.save();

  // await new Email(user, _).sendPasswordResetSuccess();

  // Update passwordChangedAt property
  // Log in user, send JWT
  createSendToken(user, 200, res);

  next();
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // if (!user) {
  //   return next(new AppError('No user found with that password', 401));
  // }
  // Check if user password is the same as passwor in db
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Invalid username or password', 401));
  }
  // If so update password
  user.password = req.body.password;
  // user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // log in user
  createSendToken(user, 201, res);

  next();
});

/*

exports.addToCart = asyncHandler(async (req, res, next) => {
  const { bookId, quantity } = req.body;
  const userId = req.user._id;
  console.log('Uses', userId);
  try {
    const cart = await Cart.findOne({ userId });
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
        userId,
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

*/

exports.getCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  if (!userId) {
    return next(new AppError('This is invalid', 400));
  }
  try {
    const cart = await Cart.findOne({ userId }).populate('books.bookId');
    console.log('mm', cart);
    const { books } = cart;
    console.log('nim', books);
    const booky = books.map((item) => item.bookId);
    console.log('.id', booky);
    booky.forEach((bookId) => {
      console.log('jjj', bookId.title);
      console.log('vvv', bookId.price);
    });
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
  const userId = req.user._id;
  const { bookId } = req.query;
  try {
    let cart = await Cart.findOne({ userId });

    const bookIndex = cart.books.findIndex((book) => book.bookId == bookId);
    console.log('hh', bookId);
    console.log('ss', bookIndex);
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

exports.createCart = asyncHandler(async (req, res, next) => {
  const { bookId, quantity } = req.body;
  const userId = req.user._id;
  console.log('use', userId);
  // console.log('Uses', _id);
  if (!userId) {
    return next(new AppError('This is invalid', 400));
  }
  try {
    const cart = await Cart.findOne({ userId }).populate('books.bookId');
    const book = await Book.findOne({ _id: bookId });
    console.log('ff', cart);
    console.log('gg', book);
    if (!book) {
      return next(new AppError('Book is not foud', 404));
    }
    const price = book.price;
    const title = book.title;

    //If cart already exists for user,
    if (cart) {
      const bookIndex = cart.books.findIndex((book) => book.bookId == bookId);
      console.log('bindx', bookIndex);
      //check if product exists or not

      if (bookIndex > -1) {
        let product = cart.books[bookIndex];
        product.quantity += quantity;

        cart.bill = cart.books.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);

        cart.books[bookIndex] = product;
        await cart.save();
        res.status(200).send(cart);
      } else {
        cart.books.push({ bookId, title, quantity, price });
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
        userId,
        books: [{ bookId, title, quantity, price }],
        bill: quantity * price,
      });
      return res.status(201).json({
        status: 'success',
        newCart,
      });
    }
  } catch (error) {
    return next(
      new AppError('There was an error adding the cart. Try again later!'),
      500
    );
  }
});

exports.getCartView = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  console.log('mm', userId);
  const cart = await Cart.findOne({ userId }).populate('books.bookId');
  console.log('ct', cart);
  const { books } = cart;
  console.log('nim', books);
  const booky = books.map((item) => item.bookId);
  console.log('.id', booky);
  booky.forEach((bookId) => {
    console.log('jjj', bookId.title);
    console.log('vvv', bookId.price);
  });

  if (!cart) {
    return next(new AppError('There is no cart available.', 404));
  }

  res.status(200).render('views/cart', {
    title: 'Your cart',
    booky,
    cart,
  });
});
/*
exports.createCart = asyncHandler(async (req, res, next) => {
  const { bookId, quantity, price } = req.body;
  const { _id } = req.user;
  console.log('Uses', _id)
  if (!_id) {
    return next(new AppError('This is invalid', 400));
  }
  try {
    let newCart = await new Cart({
      userId: _id,
      bookId,
      price,
      quantity,
    }).save();
    res.status(200).json({
      status: 'success',
      newCart,
    });
  } catch (error) {
    return next(
      new AppError('There was an error adding the cart. Try again later!'),
      500
    );
  }
});

exports.getCart = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  if (!_id) {
    return next(new AppError('This is invalid', 400));
  }
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate('books.book');
    res.status(200).json({
      status: 'success',
      cart,
    });
  } catch (error) {
    return next(
      new AppError('There was an error getting the cart. Try again later!'),
      500
    );
  }
});

exports.emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  if (!_id) {
    return next(new AppError('This is invalid', 400));
  }
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.status(204).json({
      status: 'success',
      data: cart,
    });
  } catch (error) {
    return next(
      new AppError('There was an error removing the cart. Try again later!'),
      500
    );
  }
});

exports.getOrders = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  if (!_id) {
    return next(new AppError('This is invalid', 400));
  }
  try {
    const userorders = await Order.findOne({ orderby: _id })
      .populate('products.product')
      .populate('orderby')
      .exec();
    res.json(userorders);
  } catch (error) {
    res.status(200).json({
      status: 'success',
      userorders,
    });
  }
});

exports.addToCart = asyncHandler(async (req, res, next) => {
  const { bookId, quantity, price } = req.body;
  const { _id } = req.user;
  if (!_id) {
    return next(new AppError('This is invalid', 400));
  }
  let cart = await Cart.findOne({ _id });
  if (cart) {
    const itemIndex = cart.books.findIncex(
      (p) => p.booktId.toString() === bookId
    );
    if(itemIndex > -1) {
      cart.books[itemIndex].quantity += quantity
    }
  }
});

*/
