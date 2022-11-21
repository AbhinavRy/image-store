const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const userCountSchema = new Schema({ 
    userType:{
        type: String,
        required: true
    },
    userId: {
        type: Number,
        default: 0
    },
});

module.exports = UserCount = mongoose.model('userCount', userCountSchema);