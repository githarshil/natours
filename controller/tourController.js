const fs = require('fs');
const Tour = require('./../models/tourmodel');
const Review = require('../models/reviewModel');
const factoryHandler = require('./handlerfactory.js');
const APIFeatures = require('./../utils/Apifeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );
exports.aliasTopTours = (req, res, next) => {
  // Solution for Express version 5.x
  const url = new URL(req.originalUrl, `http://${req.headers.host}`);

  url.searchParams.set('limit', '5');
  url.searchParams.set('sort', '-ratingsAverage,price');
  url.searchParams.set('fields', 'name,price,ratingsAverage');

  req.url = url.pathname + url.search;

  next();
};

exports.getAllTours = factoryHandler.getAll(Tour);

exports.createTour = factoryHandler.createOne(Tour);

exports.getTour = factoryHandler.getOne(Tour, { path: 'reviews' });

exports.updateTour = factoryHandler.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });
exports.deleteTour = factoryHandler.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRating: {
          $avg: '$ratingsAverage',
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.busiestMonth = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const busy = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      busy,
    },
  });
});
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng)
    return next(
      new AppError('Please provide lat and lng in format lat,lng', 400),
    );
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });
  console.log('params:', req.params);
  console.log('latlng:', latlng);
  console.log('lat:', lat, 'lng:', lng);
  console.log('radius:', radius);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});
