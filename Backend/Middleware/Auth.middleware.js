const JWT = require('jsonwebtoken')
const User = require("../Models/user.model");


const protect = async ( req ,res , next)=>{
       const token = req.headers.authorization?.split(' ')[1];
        if (token) {
      try {
         const decoded = JWT.verify(token , process.env.JWT_SECRET);
         req.user = await User.findById(decoded.id).select('-password');
         
         if(!req.user){
             return res.status(401).json({massage:"no authorized" })
         }
         next();
      } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
      }
}
else{return res.status(401).json({massage:"no authorized" })
}
}

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = {admin , protect}