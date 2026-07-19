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
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173", "https://spark-spire-two.vercel.app", "ws://localhost:5173", "wss://localhost:5173"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}))
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5000', 'https://spark-spire-two.vercel.app'],
    credentials: true
}));
app.use('/api/auth' , AuthRoute)
app.use('/api/bookings' , BookingRoute)
app.use('/api/events' , EventRoute)
const port = process.env.PORT || 5000;
const frontendDist = path.join(__dirname, '../Frontend/dist');

app.use(express.static(frontendDist));
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server connected and running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });
