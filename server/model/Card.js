const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    creator_id: { type: String, required: true },
    picture_url: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    expire_at: {type: Date, default: Date.now, expires: 30*24*60*60}
  }
);

const Card = mongoose.model('Card', schema, 'cards');

module.exports = Card;