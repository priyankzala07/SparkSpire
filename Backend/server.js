const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const  AuthRoute  = require('./Routes/Auth')
const  BookingRoute  = require('./Routes/Booking')
const  EventRoute  = require('./Routes/Event')
const path = require("path");
const cookieParser = require('cookie-parser')

const mongoose = require('mongoose')
require('dotenv').config()
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(cors())
// app.use(cors({
//     origin: 'https://your-frontend-domain.com',
//     credentials: true
// }));
app.use('/api/auth' , AuthRoute)
app.use('/api/bookings' , BookingRoute)
app.use('/api/events' , EventRoute)
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server connected and running on port " + process.env.PORT);
    });
})
.catch(console.error);
app.use(express.static(path.join(__dirname, "../Frontend/dist")));

app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
});
app.listen(process.env.PORT, () => {
        console.log("Server created");
});
