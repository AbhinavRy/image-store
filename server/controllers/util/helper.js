const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.encryptPassword = async (plainText) => {
    return await bcrypt.hash(plainText, saltRounds)
}

exports.comparePass = async (password, hash) => {
    const match = await bcrypt.compare(password, hash);
    if(match) {
        return true;
    }
    return false;
}

exports.decodeJwt = (token) => {
    return jwt.verify(token, process.env.JWT_KEY);
}

exports.validatePhoneNumber = (input_str) => {
    input_str = input_str.replace(/\D/g,'')
    if(input_str.length === 10){
        return parseInt(input_str);
    }
    return false;
}