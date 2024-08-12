const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    books: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        quantity: {
          type: Number,
          required: true,
        },
        name: String,
        price: {
          type: Number,
        },
      },
    ],
    bill: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// cartSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'book',
//     select: 'title',
//   });
//   next();
// });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

// books: [
//   {
//     book: {
//       type: mongoose.Schema.ObjectId,
//       ref: 'Book',
//     },
//     count: Number,
//     price: Number,
//   },
// ],
// cartTotal: Number,
// orderby: {
//   type: mongoose.Schema.ObjectId,
//   ref: 'User',
// },
