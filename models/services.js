const mongoose = require('mongoose') ; 
const Schema = mongoose.Schema;

const admin = new Schema({
    nin : String  , 
    message: String , 
    email : String , 
    location: String 
})  ;

module.exports = new mongoose.model('Organ' , admin) ; 
