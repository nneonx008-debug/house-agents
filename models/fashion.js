const  mongoose  =require('mongoose')  ;

const Schema = mongoose.Schema ; 
const fashionSchema = new Schema({
    title : String , 
    price:String , 
    category:String , 
    phonenumber:String , 
    description:String ,  
      country:String , 

    bgimg:String , 
      specific :String , 

    secondimg:String , 
    extraimg:String,
    location:String  , 
    thirdimg:String  , 
      boosting:{
    type:Number ,
    default : 0 
  } ,
    color:String  ,
          VIP: { type: Boolean, default: false }, // 👈 new f

    gender:String  ,
    userId:{type:mongoose.Schema.Types.ObjectId , ref:'User'}
}) ; 
module.exports  = mongoose.model('Fashion'  ,fashionSchema )