const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    books: [
      {
        book: {
          type: mongoose.Schema.ObjectId,
          ref: 'Book',
        },
        count: Number,
      },
    ],

    paymentIntent: {},
    orderby: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
