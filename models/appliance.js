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
  boost: { type: Date , default:null } // When VIP boost ends
})
module.exports = mongoose.model('Appliances' , appliance);
