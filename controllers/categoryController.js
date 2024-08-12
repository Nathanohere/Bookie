const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const handler = require('./controlHandler');

// const createCategory = asynchandler(async (req, res) => {
//   const newCategory = await Category.create(req.body);
// });

exports.createCategory = handler.createOne(Category);
exports.updateCategory = handler.updateOne(Category);
exports.deleteCategory = handler.deleteOne(Category);
exports.getCategory = handler.getOne(Category);
exports.getAllCategory = handler.getAll(Category);
