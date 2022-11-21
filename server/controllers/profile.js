const jwt = require('jsonwebtoken');
const User = require("../models/user");
const { decodeJwt, validatePhoneNumber } = require("./util/helper");
 
exports.getProfile = async (req, res) => {
    try {
        const { userId } = decodeJwt(req.headers.authorization || "");
        if(!userId){
            return res.status(401).json({ message: "Access Denied." });
        }
        const hidden = { 
            password: 0,
        };
        const result = await User.findOne({ userId }, { ...hidden });
        if(result){
            return res.status(200).json({ data: result });
        }
        else{
            res.status(500).json({ message: "Unable to get profile details." });
        }
    } catch (error) {
        console.log("Caught error",error.message);
        res.status(500).json({ message: "Something went wrong." });
    }
}

exports.editProfile = async (req, res) => {
    const bodyData = req.body;
    try {
        const { userId } = decodeJwt(req.headers.authorization || "");
        if(!userId){
            return res.status(401).json({ message: "Access Denied." });
        }
        const immutables  = ["userId"];
        immutables.forEach(x => {
            delete bodyData[x];
        })
        if(bodyData.password){
            let passPattern = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
            if(!passPattern.test(bodyData.password)){
                return res.status(400).json({ message: `Password is weak(set a password with minimum 8 characters with 1 uppercase character, 1 lowercase character, 1 number and 1 special character).` });
            }
            bodyData.password = await encryptPassword(bodyData.password);
        }
        if(bodyData.mobile){
            if(!bodyData.mobile.number){
                return res.status(400).json({ message: "Mobile number must be in object format with fields of countryCode and number field." });
            }
            bodyData.mobile.number = validatePhoneNumber(bodyData.mobile.number);
            if(!bodyData.mobile.number){
                return res.status(400).json({ message: "Mobile number invalid." });
            }
        }
        const result = await User.findOneAndUpdate(
            {
                userId: userId
            },
            {
                ...bodyData
            },
            {
                new: true,
                rawResult: true
            }
        )
        if(result && result.lastErrorObject.updatedExisting){
            return res.status(200).json({ message: "Profile updated successfully." });
        }
        else{
            res.status(500).json({ message: "Unable to update profile." });
        }
    } catch (error) {
        console.log("Caught error",error.message);
        res.status(500).json({ message: "Something went wrong." });
    }   
}
