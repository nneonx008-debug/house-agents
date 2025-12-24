const mongoose  =require('mongoose') ; 
const Schema =  mongoose.Schema ; 
const freindSchema  = new Schema ({
    userId : {type:mongoose.Schema.Types.ObjectId , ref : 'user'} , 
    email :String , 
   link : String  
    
    
})
module.exports = mongoose.model('Freinds' , freindSchema)