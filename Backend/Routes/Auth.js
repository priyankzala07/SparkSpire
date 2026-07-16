const express = require('express')
const {registerUser , loginUser , verifyOtp} = require('../Controllers/Auth.controller')
const router = express.Router()

router.post('/registration' , registerUser)
router.post('/login' ,loginUser)
router.post('/verifyOtp' , verifyOtp)

module.exports = router ;