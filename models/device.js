const mongoose = require ('mongoose') ; 
const Schema = mongoose.Schema ;

const deviceSchema = new Schema({
    title:String , 
    category:String , 
    manufacturer:String , 
    price:String ,
    location:String , 
    description:String , 
    condition:String ,
      country:String , 

    bgimg:String , 
      specific :String , 

    extraimg:String , 
    secondimg:String , 
    phonenumber:String ,
      boosting:{
    type:Number ,
    default : 0 
  } ,
    thirdimg:String  ,
    
      VIP: { type: Boolean, default: false }, // 👈 new f
    userId:{type:mongoose.Schema.Types.ObjectId , ref:'User'}
} ,{timestamps:true}) ; 
module.exports = mongoose.model('Devices' , deviceSchema) ; 

