const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    card_id: { type: String, required: true },
    expire_at: {type: Date, default: Date.now, expires: 30*24*60*60}
  }
);

const Share = mongoose.model('Share', schema, 'shares');

module.exports = Share;