const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:   { type: String || mongoose.Schema.Types.ObjectId , ref: 'User', required: true } ,
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:  { type: String, required: true },
  isRead:   { type: Boolean, default: false },   // ✅ track read/unread
  isfeedback:{type: Boolean , default : false} , 
  isChat : {type : Boolean ,default:false}  ,
  lik:{type : String } , 
  type:     { type: String, enum: ["message", "feedback"], default: "message" }, // ✅ notification type
}, {timestamps:true});

module.exports = mongoose.model('Message', messageSchema);
