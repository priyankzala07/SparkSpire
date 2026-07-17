const userModel = require('../Models/user.model')
const OTPModel = require('../Models/Otp.model')
const bcrypt = require('bcryptjs')
const {sendOTPEmail} = require('../Utils/Email')
const jwt = require('jsonwebtoken')

const generateToken =  ( id , role )=>{
    return jwt.sign(
    {
    id,
     role 
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

}

const registerUser = async (req, res) => {

const email = req.body.email?.trim().toLowerCase();

if (!email) {
    return res.status(400).json({
        message: "Email is required"
    });
}
    const { userName,  password } = req.body;

    try {
        const userExists = await userModel.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: 'User already exists',
            });
        }
if (!password) {
    return res.status(400).json({
        message: "Password required"
    });
}
                if (password.length < 8) {
        return res.status(400).json({
            message: "Password must be at least 8 characters."
        });
        }
        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name: userName,
            email,
            password: hash,
            role: 'user',
            isVerified: false,
        });

        const crypto = require("crypto");
        const otp = crypto.randomInt(100000, 1000000).toString();
        

        await OTPModel.create({
            email,
            code: otp,
            action: 'account_verification',
        });

        await sendOTPEmail(email, otp, 'account_verification');

        return res.status(201).json({
            message: 'User registered successfully. Please check your email for OTP verification.',
            email: user.email,
        });
    } catch (err) {
        return res.status(400).json({
            message: err.message,
        });
    }
};

const loginUser = async ( req , res ) => {
try {

const email = req.body.email?.trim().toLowerCase();

if (!email) {
    return res.status(400).json({
        message: "Email is required"
    });
}
    const  {password} = req.body

const user = await userModel.findOne({ email });


    if(!user){
        return res.status(400).json({message:"user not exits please register yourself"})
    }

const passwordVerify = await bcrypt.compare(password, user.password);
    if(!passwordVerify){
       return res.status(400).json({message:"password is invalid "})
    }
    if(!user.isVerified && user.role==='user'){
const crypto = require("crypto");
const otp = crypto.randomInt(100000, 1000000).toString();
            await OTPModel.deleteMany({email , action : 'account_verification'})
        await OTPModel.create({
            email,
            code: otp,
            action: "account_verification"
        });
            await sendOTPEmail(email , otp , 'account_verification') 
            return res.status(400).json({
            needsVerification: true,
            message: 'Your account is not verified. Please use the OTP sent to your email.'
            });
    }

    res.json({
        message:"login succesfully",
        id : user._id,
        name: user.name,
        email : user.email,
        role : user.role,
        token : generateToken( user._id , user.role)
    })
} catch (err) {
      return res.status(500).json({
        message: "Internal server error",
        error: err.message
      });
    }
    }

    const verifyOtp = async ( req , res ) => {
    try {

const email = req.body.email?.trim().toLowerCase();

if (!email) {
    return res.status(400).json({
        message: "Email is required"
    });
}
    const otp = req.body.otp.toString().trim();

    const otpRecord = await OTPModel.findOne({
    email,
    code: otp,
    action: "account_verification"
    });

    if(!otpRecord){
       return res.status(400).json({
        message: "Invalid OTP. Please try again."
        })
    }

const user = await userModel.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true, returnDocument: 'after' }
);
    await OTPModel.deleteMany({email , action:'account_verification'})
    res.json({
        message:"Account verified. Now you can login .",
        id : user._id,
        name: user.name,
        email : user.email,
        role : user.role,
        token : generateToken( user._id , user.role)
    })
}
catch (err) {
  return res.status(500).json({
    message: "Internal server error",
    error: err.message
  });
} 
}


module.exports = {registerUser , loginUser , verifyOtp}