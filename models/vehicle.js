const mongoose  =require('mongoose') ;  
const Schema  = mongoose.Schema ; 

const  vehicleSchema  = new Schema({
    title :String  ,
    price:String  , 
    mileage:String  ,
    fueltype:String  ,
    location:String  , 
      specific :String , 

    category:String , 
    transmission:String , 
    bgimg:String  ,
      country:String , 

    description:String , 
    phonenumber:String  ,
    extraimg:String  ,
    secondimg:String  ,
    thirdimg:String , 
      boosting:{
    type:Number ,
    default : 0 
  } ,
          VIP: { type: Boolean, default: false }, // 👈 new f

    userId:{type : mongoose.Schema.Types.ObjectId , ref:'User'}
})


module.exports = mongoose.model('Vehicle'  , vehicleSchema);