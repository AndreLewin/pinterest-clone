const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    username: { type: String, unique: true },
    expire_at: {type: Date, default: Date.now, expires: 30*24*60*60}
  }
);

const User = mongoose.model('User', schema, 'users');

module.exports = User;