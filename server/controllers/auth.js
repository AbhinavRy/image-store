const jwt = require('jsonwebtoken');
const User = require("../models/user");
const UserCount = require("../models/userCount");
const { sendMail } = require('../utils/nodemailer');
const { encryptPassword, comparePass, validatePhoneNumber, decodeJwt } = require("./util/helper");

const BASE_URL = process.env.ENV === "dev" ? "http://localhost:5000" : process.env.PROD_URL;

exports.authLogin = async (req, res) => {
    const bodyData = req.body;
    // console.log(bodyData)
    try {
        if(!bodyData.emailId || !bodyData.password){
            return res.status(400).json({ message: "Missing credentials." });
        }
        let result = await User.findOne({ emailId: bodyData.emailId })
        if(result){
            if(await comparePass(bodyData.password, result.password)){
                let expiresIn = '24h';
                if(bodyData?.rememberMe){
                    expiresIn = '7d'
                }
                const token = jwt.sign({ userId: result.userId }, process.env.JWT_KEY, { expiresIn: expiresIn });
                if(token){
                    res.cookie(process.env.COOKIE_NAME, token, {
                        maxAge: 1000*60*60*24*(bodyData?.rememberMe? 7 : 1),
                        httpOnly: true,
                        secure: false,
                    });
                    return res.status(200).json({ token });
                }
            }
            // return res.status(401).json({ message: "Invalid credentials." });
        }
        return res.status(401).json({ message: "Invalid credentials." });
    } catch (error) {
        console.log("Caught error",error.message);
        res.status(500).json({ message: "Something went wrong." });
    }
}

exports.authSignup = async (req, res) => {
    const bodyData = req.body;
    try {
        if(!bodyData.password){
            return res.status(401).json({ message: "Missing Password." });
        }
        let passPattern = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
        if(!passPattern.test(bodyData.password)){
            return res.status(400).json({ message: `Password is weak(set a password with minimum 8 characters with 1 uppercase character, 1 lowercase character, 1 number and 1 special character).` });
        }
        if(bodyData.phoneNo){
            if(!bodyData.phoneNo.number){
                return res.status(400).json({ message: "Mobile number must be in object format with fields of countryCode and number field." });
            }
            bodyData.phoneNo.number = validatePhoneNumber(bodyData.phoneNo.number);
            if(!bodyData.phoneNo.number){
                return res.status(400).json({ message: "Mobile number invalid." });
            }
        }
        bodyData.password = await encryptPassword(bodyData.password);
        const count = await UserCount.findOneAndUpdate({ userType: 'dev' }, { $inc: { userId: 1 } }, { new: true, upsert: true });
        bodyData.userId = count.userId;
        const userData = new User({...bodyData});

        await userData.save();

        const verificationToken = jwt.sign({ userId: userData.userId, emailId: userData.emailId }, process.env.JWT_KEY, { expiresIn: '30m' })
        const verificationLink = `${BASE_URL}/auth/verify?token=${verificationToken}`
        const dataObj = {
            to:bodyData.emailId, 
            subject: "User Verification",
            text: `Please verify your email by using the link below. \n ${verificationLink}`, 
            html: `<p>Please verify your email by using the button or link below.</p>
            <div style="width:100%;text-align:center">
                <a 
                    target="_blank" href=${verificationLink} 
                    style="cursor:pointer;color:#fffff6;background-color:#8D72E1;padding:10px"
                >Verify Account
                </a>
            </div>
            <p><a target="_blank" href=${verificationLink}>${verificationLink}</a></p>`
        }
        const emailLink = await sendMail(dataObj);

        const token = jwt.sign({ userId: userData.userId }, process.env.JWT_KEY, { expiresIn: '24h' })
        if(token){
            // res.cookie(process.env.COOKIE_NAME, token, {
            //     maxAge: 1000*60*60*24,
            //     httpOnly: true,
            //     secure: false,
            // });
            return res.status(200).json({ token, emailLink });
        }
            
        return res.status(400).json({ message: "Bad Request." });
    } catch (error) {
        console.log("Caught error",error.message);
        res.status(500).json({ message: error.message });
    }
}

exports.emailVerify = async (req, res) => {
    const { token } = req.query;
    try {
        const { userId, emailId } = decodeJwt(token || "");
        if(emailId && userId){
            const update = await User.findOneAndUpdate({ emailId, userId }, { verified: true }, { new: true, rawResult: true });
                if(update && update.lastErrorObject.updatedExisting)
                    return res.status(200).json({ message: "Verification Successful." });
        }
        res.status(400).json({ message: "Invalid or Expired token." });
    } catch (error) {
        console.log("Caught error",error.message);
        res.status(400).json({ message: "Invalid or Expired token." }); 
    }
}