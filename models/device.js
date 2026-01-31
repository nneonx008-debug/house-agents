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
    thirdimg:String  ,
    
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
  boost: { type: Date , default:null }, // When VIP boost ends,
      userId:{type:mongoose.Schema.Types.ObjectId , ref:'User'}} ,{timestamps:true}) ; 
module.exports = mongoose.model('Devices' , deviceSchema) ; 

