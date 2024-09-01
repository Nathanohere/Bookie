const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimiter = require('express-rate-limit');
const monogoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');

const AppError = require('./utils/appError');
const bookRouter = require('./routes/bookRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/viewRoute');
const categoryRouter = require('./routes/categoryRoute');
const paystackRouter = require('./routes/paystackRoute');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');

// Define where views are located in file system
app.set('views', path.join(__dirname), 'views');

app.use(cors());

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

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/paystack', paystackRouter);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
