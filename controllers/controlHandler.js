const asyncHandler = require('express-async-handler');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document exists with that Id', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document exists with that Id', 404));
    }
    res.status(200).json({
      status: 'success',
      doc,
    });
  });

exports.getAll = (Model) =>
  asyncHandler(async (req, res) => {
    // To allow for nested get reviews on book
    let filter = {};
    if (req.params.bookId) filter = { book: req.params.bookId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      doc,
    });
  });
