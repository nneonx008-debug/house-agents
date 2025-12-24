const mongoose = require('mongoose') ; 
const Schema = mongoose.Schema ; 
const furniture  =  new Schema({
    title:String , 
    category:String , 
    condition:String , 
    price:String ,
    description:String , 
      country:String , 

    material:String ,
    location:String , 
      specific :String , 

    phonenumber:String ,
    bgimg:String , 
      boosting:{
    type:Number ,
    default : 0 
  } ,
    extraimg:String , 
    userId:{type:mongoose.Schema.Types.ObjectId , ref:'User'} , 
    secondimg:String , 
          VIP: { type: Boolean, default: false }, // 👈 new f

    thirdimg:String 
    
})
module.exports = mongoose.model('Furnitures' , furniture)