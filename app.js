const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const appError = require('./utils/appError');
const errorController = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
app.use(compression());

// parse nested query strings (e.g. ?duration[gte]=5) into objects
// Express uses the "simple" parser by default which produces keys like
// "duration[gte]". Switching to "extended" makes req.query:{duration:{gte:'5'}}
app.set('query parser', 'extended');

// Set view engine and views directory
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

const TourRouter = require('./routes/tourRoutes');
const UserRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  console.log('hello from the middleware');
  console.log(req.headers);
  next();
});
app.use('/', viewRouter);
app.use('/api/v1/tours', TourRouter);
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/review', reviewRouter);
app.all(/.*/, (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(errorController);
// User route handler functions

// Wire user routes

// Route handler functions

module.exports = app;
