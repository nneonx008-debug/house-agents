const mongoose = require('mongoose') ; 
const Schema = mongoose.Schema ; 
const adsScheme = new mongoose.Schema({
    price: String , 
    title :String ,
    location:String , 
    specific:String , 
    userId : {type : mongoose.Schema.Types.ObjectId , ref: 'User'}
});
module.exports = mongoose.model('ADS' , adsScheme);