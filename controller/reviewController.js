const fs = require('fs');
const Review = require('./../models/reviewModel');
const factoryHandler = require('./handlerfactory.js');
const catchAsync = require('./../utils/catchAsync');
exports.getAllReviews = factoryHandler.getAll(Review);
exports.createReview = catchAsync(async (req, res, next) => {
  // ✅ must set tour and user if not in body
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);
  res.status(201).json({
    data: newReview,
  });
});
exports.updateReview = factoryHandler.updateOne(Review);
exports.deleteReview = factoryHandler.deleteOne(Review);
exports.getReview = factoryHandler.getOne(Review);
