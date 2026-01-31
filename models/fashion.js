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
    color:String  ,
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
    gender:String  ,
    userId:{type:mongoose.Schema.Types.ObjectId , ref:'User'}
}) ; 
module.exports  = mongoose.model('Fashion'  ,fashionSchema )
