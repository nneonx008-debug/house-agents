const  mongoose =  require('mongoose') ; 
const report =  new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId , ref: 'user' 
    },
    victim: {type:mongoose.Schema.Types.ObjectId , ref: 'user'} ,
    isBlocked : {type: Boolean ,default:false}
    
})

module.exports = mongoose.model('report' , report) ; 