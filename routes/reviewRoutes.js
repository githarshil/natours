const express = require('express');
const router = express.Router({
  mergeParams: true,
});
const reviewController = require('./../controller/reviewController.js');
const authController = require('./../controller/authController.js');
router.use(authController.protect);
router.route('/').get(reviewController.getAllReviews).post(
  // authController.restrictTo('user'),
  reviewController.createReview,
);
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);
module.exports = router;
