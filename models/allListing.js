const mongoose = require("mongoose");

const allListingSchema = new mongoose.Schema({
  refId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the original document
  category: {
    type: String,
    enum: ["Appliances", "Fashion", "Vehicle", "Devices", "Furnitures", "Houses"],
    required: true
  },
  bgimg:String , 
  location:String , 
  country:String , 
  specific :String , 
  title:String  ,
  boosting:{
    type:Number ,
    default : 0 
  } ,
  price:String , 
  createdAt: { type: Date, default: Date.now },
        VIP: { type: Boolean, default: false }, // 👈 new field

});

const AllListing = mongoose.model("AllListing", allListingSchema);
module.exports = AllListing;
