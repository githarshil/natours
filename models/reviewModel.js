const mongoose = require('mongoose');
const tour = require('./tourmodel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'a review much contain the description'],
    },
    rating: {
      type: Number,
      required: [true, 'a review must contain a rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      // default: new Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'a review must have a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'a review must have a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });
});
reviewSchema.statics.calcAvgRating = async function (tourID) {
  const stats = await this.aggregate([
    { $match: { tour: tourID } },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  await tour.findByIdAndUpdate(tourID, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRatings,
  });
};
reviewSchema.post('save', function () {
  this.constructor.calcAvgRating(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne(); // save to query object
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.rev.constructor // this.rev still available ✅
    .calcAverageRatings(this.rev.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
