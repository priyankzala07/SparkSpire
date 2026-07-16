const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const  AuthRoute  = require('./Routes/Auth')
const  BookingRoute  = require('./Routes/Booking')
const  EventRoute  = require('./Routes/Event')

const mongoose = require('mongoose')
require('dotenv').config()

app.use(express.json())
app.use(cors())
app.use(helmet())

app.use('/api/auth' , AuthRoute)
app.use('/api/bookings' , BookingRoute)
app.use('/api/events' , EventRoute)
  mongoose.connect(process.env.MONGO_URI)
.then(()=>{ 
    console.log("connected to database");
})
.catch((error)=>{
    console.error("cant connect" , error)
})
app.listen(process.env.PORT , ()=>{
    console.log("server created");
})