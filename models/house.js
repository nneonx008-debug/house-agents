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

  comments: [{ 
    text: String, 
    date: { type: Date, default: Date.now } 
  }],
    category : String , 
    location :String  ,
          VIP: { type: Boolean, default: false }, // 👈 new f

})

module.exports  =  mongoose.model('House'  ,housesSchema)
