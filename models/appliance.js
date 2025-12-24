const mongoose = require('mongoose') ; 
const Schema = mongoose.Schema ; 
const appliance = new Schema ({
    userId:{type:mongoose.Schema.Types.ObjectId , ref:'User'}  ,
    title:String , 
    category:String , 
    description : String  ,
    price:String , 
      country:String , 

    condition:String , 
    phonenumber:String , 
      specific :String , 

    bgimg:String , 
    extraimg:String , 
    secondimg:String, 
      boosting:{
    type:Number ,
    default : 0 
  } ,
    thirdimg:String , 
    location:String ,
      VIP: { type: Boolean, default: false }, // 👈 new field

})
module.exports = mongoose.model('Appliances' , appliance);