const User = require('./../models/userModel');
const factoryHandler = require('./handlerfactory.js');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});
const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('not an image', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerfilter,
});

exports.userPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = factoryHandler.getAll(User);
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError('password cannot be changed', 400));
  }
  const filterBody = filterObj(req.body, 'name', 'email');

  // Handle photo upload
  if (req.file) {
    filterBody.photo = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});
exports.deleteMe = async (req, res, next) => {
  const deletedUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({
    status: 'success',
    data: null, // 204 = no content
  });
};
exports.getUser = factoryHandler.getOne(User);
exports.createUser = factoryHandler.createOne(User);
exports.updateUser = factoryHandler.updateOne(User);
exports.deleteUser = factoryHandler.deleteOne(User);
exports.deleteUser = factoryHandler.deleteOne(User);
