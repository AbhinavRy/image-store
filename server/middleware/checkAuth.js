const jwt = require('jsonwebtoken');
const User = require("../models/user");

exports.checkAuth = async (req, res, next) => {
    try {
        const { authToken } = req.cookies;
        // console.log(req.headers.cookie);
        // const authToken = req.headers.cookie.toString().split('=').slice(1).join('')
        // .split(';').slice(0, -1).join('');
        
        if(!authToken){
            return res.status(401).json({ message: "Invalid Token. Access Denied." });
        }
        const verified = jwt.verify(authToken, process.env.JWT_KEY);
        if(!verified){
            return res.status(401).json({ message: "Access Denied." });
        }
        else{
            const result = await User.findOne({ userId: verified.userId }, { password: 0 });
            if(result){
                req.user = result;
                return next();
            }
            
            return res.status(401).json({ message: "Access Denied." });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Access Denied." });
    }
}

exports.checkVerification = (req, res, next) => {
    if(req.user.verified){
        next();
    }
    else{
        return res.status(403).json({ message: "User not Verified. Access Denied." });
    }
}