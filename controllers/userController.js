const User = require('../models/userModel');
const AppError = require('../utils/appError');
const asyncHandler = require('express-async-handler');
const handler = require('./controlHandler');

exports.getAllUsers = handler.getAll(User);
exports.getUser = handler.getOne(User);
exports.updateUser = handler.updateOne(User);
exports.deleteUser = handler.deleteOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

const filterObj = (obj, ...allowfields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowfields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = asyncHandler(async (req, res, next) => {
  //  Throw error if user posts password update
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not to update password. Use /updatePassword',
        400
      )
    );
  }
  // Find user and update
  const filtereBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filtereBody, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
  next();
});

exports.deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
