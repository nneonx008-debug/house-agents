const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image:    { type: String } ,// store filename of uploaded image
  credit: {type :Number , default:0},
  adCount:  { type: Number, default: 0 }, // ✅ new field
  rating : {
    type:Number , 
    default : 0
  },
    savedAds: [
    {
      adId: String,
      category: String,
      bgimg: String,
      title: String,
      price: String,
      location: String,
      specific: String
    }
  ]
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
