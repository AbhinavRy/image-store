const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const mediaSchema = new Schema(
    { 
        userId:{
            type: String,
            require: true
        },
        media:{
            type: Array,
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = Media = mongoose.model('media', mediaSchema);