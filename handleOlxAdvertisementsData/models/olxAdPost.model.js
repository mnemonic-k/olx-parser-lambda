const mongoose = require('mongoose');

const olxAdPostSchema = new mongoose.Schema({
  uuid: Number,
  title: String,
  description: String,
  price: String,
  seller: String,
  postedAt: String,
  contactPhone: String,
  location: String
});

module.exports.OlxAdPost = mongoose.model('OlxAdPost', olxAdPostSchema);