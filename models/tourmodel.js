const mongoose = require('mongoose');
const User = require('./userModel');
const Review = require('./reviewModel');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must contain a name'],
      Unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'a tour must contain a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must contain a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must contain a difficulty'],
    },
    price: {
      type: Number,
      default: 4.5,
    },
    ratingsAverage: {
      type: Number,
      required: [true, 'a tour must contain a rating'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'a tour must contain a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'a tour must contain a image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // hide from output if desired
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // references the User model
      },
    ],
    review: [
      {
        type: mongoose.Schema.ObjectId,
        ref: Review,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
toursSchema.pre('save', function (next) {
  if (!this.guides || !this.isModified('guides')) return next();
  const GuidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = Promise.all(GuidesPromises);
});
toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
});

const Tour = mongoose.model('Tour', toursSchema);
module.exports = Tour;
