const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const GLOBAL = require('../service/Global');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
 role: {
  type: String,
  validate: {
    validator: function (v) {
      return Object.keys(GLOBAL.ROLES).some(role => role.toLowerCase() === v.toLowerCase());
    },
    message: props => `'${props.value}' is not a valid role`
  },
  required: true,
}

});

// ✅ Pre-save hook to hash password automatically
userSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Method to validate password
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
