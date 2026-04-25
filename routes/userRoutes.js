const fs = require('fs');

const express = require('express');

const router = express.Router();
const UserHandler = require('../controller/userController');
const authController = require('./../controller/authController');
const userController = require('./../controller/userController');
const { getAllUsers, createUser, getUser, updateUser, deleteUser } =
  UserHandler;

router.route('/login').post(authController.login);
router.route('/signup').post(authController.signup);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.use(authController.protect);
router.route('/updateMyPassword').patch(authController.updateMyPassword);
router
  .route('/updateMe')
  .patch(userController.userPhoto, userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);
router.use(authController.restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
module.exports = router;
