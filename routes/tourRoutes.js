const express = require('express');
const reviewRouter = require('./../routes/reviewRoutes');
const TourController = require('../controller/tourController');
const router = express.Router();
const authController = require('./../controller/authController');

// router.param('id', TourHandler.checkID)
router.use('/:tourId/reviews', reviewRouter);
router.get(
  '/top-5-cheap',
  TourController.aliasTopTours,
  TourController.getAllTours,
);
router.route('/tourstats').get(TourController.getTourStats);
router.route('/busiestMonth/:year').get(TourController.busiestMonth);
router
  .route('/')
  .get(authController.protect, TourController.getAllTours)
  .post(TourController.createTour);
router
  .route('/:id')
  .get(TourController.getTour)
  .patch(TourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    TourController.deleteTour,
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(TourController.getToursWithin);
module.exports = router;
