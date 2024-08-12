const mongoose = require('mongoose');

const slugify = require('slugify');
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A book must have a title'],
    },
    isbn: {
      type: String,
      required: [true, 'A book must have ISBN'],
    },
    slug: String,
    pageCount: {
      type: Number,
      required: [true, 'A book must have number of pages'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'A book must have an image cover'],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
    },
    shortDescription: {
      type: String,
      required: [true, 'A book must have a description'],
    },
    longDescription: {
      type: String,
      required: [true, 'A book must have a description'],
    },
    authors: [String],
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be above 1.0'],
      min: [1, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    categories:[String],
    price: {
      type: Number,
      required: [true, 'A book must have a price'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookSchema.index({ price: 1 });
bookSchema.index({ slug: 1 });

bookSchema.set('toObject', { virtuals: true });
bookSchema.set('toJSON', { virtuals: true });

// Virtual populate
bookSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'book',
  localField: '_id',
});

bookSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
