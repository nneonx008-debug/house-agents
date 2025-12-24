const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  username: String,
  text: String,
  messageMe:{type : mongoose.Schema.Types.ObjectId , ref: 'User'} ,
  category: {
    type: String, // "Houses", "Fashion", etc.
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'categoryModel'
  },
  categoryModel: {
    type: String,
    required: true,
    enum: ["Houses", "Fashion", "Furnitures", "Devices", "Vehicle", "Appliances"]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
