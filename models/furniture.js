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
    extraimg:String , 
    userId:{type:mongoose.Schema.Types.ObjectId , ref:'User'} , 
    secondimg:String , 
    expired:{type: Boolean , default:false} , 
    deadline : {type : Date , default : null} , 
    deleteconfirm: {type:Boolean , default:false} , 
          VIP: { type: Boolean, default: false }, // 👈 new f
   createdAt: { type: Date, default: Date.now },
  adExpiresAt: { type: Date },        // When ad stops being visible
  vipExpiresAt: { type: Date , default:null },
    boostCount : {type: Number ,  default: 0},
    views : {type : Number , default : 0} ,
    names: {type:String} , 
    isFirst :{type : Boolean ,default : false },
  boost: { type: Date , default:null }, // When VIP boost ends
    thirdimg:String 
    
})
module.exports = mongoose.model('Furnitures' , furniture)
