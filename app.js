const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimiter = require('express-rate-limit');
const monogoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const bookRouter = require('./routes/bookRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/viewRoute');
const categoryRouter = require('./routes/categoryRoute');
const cartRouter = require('./routes/cartRoute');
const paystackRouter = require('./routes/paystackRoute');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');

// Define where views are located in file system
app.set('views', path.join(__dirname), 'views');

app.use(cors());

// app.use('*', (req, res, next) => {
//   res.locals.cart = req.session.cart;
//   next();
// });

// Body parser
app.use(express.json());
app.use(cookieParser());

app.use(morgan('dev'));

const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again later',
});

// GLOBAL MIDDLEWARES

// Restrict requests coming from the same api
app.use('/api', limiter);

// Set security http headers
app.use(helmet());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Data sanitization against NoSQL query injection
app.use(monogoSanitize());

app.use(
  hpp({
    whitelist: ['pageCount', 'price'],
  })
);

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' cdnjs.cloudflare.com",
    'https://example.com'
  );
  next();
});

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log('reot',req.cookies);
  next();
});

// 3) ROUTES
// app.get('/', (req, res) => {
//   res.status(200).render('views/base', {
//     book: 'Code Dojo',
//     user: test,
//   });
// });

// app.get('/overview', (req, res) => {
//   res.status(200).render('views/overview', {
//     title: 'All books',
//   });
// });

// app.get('/book', (req, res) => {
//   res.status(200).render('views/book', {
//     title: 'Code Dojo',
//   });
// });

app.use('/', viewRouter);
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/carts', cartRouter);
app.use('/paystack', paystackRouter);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
