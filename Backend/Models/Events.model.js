const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    title:{
    type:String,
    required:true,
    trim:true,
    minlength:3,
    maxlength:100
    },
    description:{
    type:String,
    required:true,
    trim:true,
    minlength:20
    },
    date:{
        type : Date,
        required : true,
        index : true
    },
    location:{
    type:String,
    required:true,
    trim:true,
    index:true
    },
    category:{
        type:String , 
        required : true,
        index : true
    },
    totalSeats: {
    type: Number,
    required: true,
    min: 1
    },
    availableSeats: {
    type: Number,
    required: true,
    default: function(){return this.totalSeats;},
    min : 0 ,
    },
    ticketPrice:{
        type : Number , 
        required : true,
        min : 0 
    },
    image:{
        type:String , 
        required : true
    }
},{timestamps  : true });

const eventModel = mongoose.model('Event', eventSchema);
module.exports = eventModel