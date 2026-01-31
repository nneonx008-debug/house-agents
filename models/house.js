const  mongoose = require('mongoose') ; 
const Schema=  mongoose.Schema  ;

const  housesSchema =  new Schema({
    userId : {type:mongoose.Schema.Types.ObjectId  , ref:'User'} ,
  title : String,
   extraimg :String , 
  bgimg : String ,  
  secondimg :String , 
  thirdimg:String , 
    country:String , 

  description:String ,  
    specific :String , 
 
    price :String , 
    phonenumber:String ,
    created:{type : Date,
        default:Date.now
    } , 
    beds : Number  ,
    baths :Number , 
    typo : String ,
    category : String , 
    location :String  ,
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

module.exports  =  mongoose.model('House'  ,housesSchema)
