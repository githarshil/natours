const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};
const createSendToken = function (user, statusCode, res, data = null) {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000,
    ),
    HttpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  const response = {
    status: 'success',
    token,
  };
  if (data) response.data = data;
  res.status(statusCode).json(response);
};
exports.signup = catchAsync(async (req, res, next) => {
  // Validate that passwords match
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(
      new appError('Please provide password and password confirm', 400),
    );
  }

  if (req.body.password !== req.body.passwordConfirm) {
    return next(new appError('Passwords do not match', 400));
  }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
  });
  createSendToken(newUser, 201, res, { newUser });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError('fill in the email or password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new appError('Invalid email or password', 401));

  const correct = await user.correctPassword(password, user.password);
  if (!correct) return next(new appError('Invalid email or password', 401));
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async function (req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return next(new appError('You are not logged in', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_KEY);
  console.log(decoded);
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new appError('User logged out', 401));
  }
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new appError('User recently changed password', 401));
  }
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError('You do not have permission', 403));
    }
    next(); // ← missing this
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new appError('No user with that email', 404));
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new appError('There was an error sending the email', 500));
  }
  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
    resetToken, // temporary - remove this in production
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');
  if (!user) {
    return next(new appError('no user found', 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new appError('incorrect password', 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});

// Middleware for server-side rendered views to check if user is logged in
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_KEY,
      );
      const user = await User.findById(decoded.id);
      if (user && !user.changedPasswordAfter(decoded.iat)) {
        res.locals.user = user;
      }
    } catch (err) {
      // Silently fail - user is not logged in
    }
  }
  next();
};

// Handle logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};
