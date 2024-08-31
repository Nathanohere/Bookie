const Category = require('../models/categoryModel');
const handler = require('./controlHandler');


exports.createCategory = handler.createOne(Category);
exports.updateCategory = handler.updateOne(Category);
exports.deleteCategory = handler.deleteOne(Category);
exports.getCategory = handler.getOne(Category);
exports.getAllCategory = handler.getAll(Category);
