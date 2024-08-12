const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  cart: {
    type: Array,
    default: [],
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    // required: [true, 'Please confirm your pasword'],
    validate: function (el) {
      return el === this.password;
    },
    message: 'Passwords are not the same',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordExpiresAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Encrypt password saved in database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next;
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

// Middleware to update passwordchangedAt property if the password hasn't been modified and if document is new
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('/^find/', function (next) {
  this.find({ active: { $ne: false } });
  next();
});
// Instance methods
userSchema.methods.correctPassword = async function (bodyPassword, dbPassword) {
  return await bcrypt.compare(bodyPassword, dbPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changeTimeStamp, JWTTimestamp);
    return JWTTimestamp < changeTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = async function () {
  // Create token
  const resetToken = require('crypto').randomBytes(32).toString('hex');

  // encrypt token to be stored in database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordExpiresAt = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
