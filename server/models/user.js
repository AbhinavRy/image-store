const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const userSchema = new Schema(
    { 
        firstName: {
            type: String,
            required: [true, "First Name is missing."]
        },
        lastName: {
            type: String,
            required: [true, "Last Name is missing."]
        },
        userId: {
            type: Number,
            immutable: true,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: [true, "Password is missing."]
        },
        emailId: {
            type: String, 
            trim: true,
            lowercase: true,
            unique: [true, "EmailId must be unique"],
            match: [/.+\@.+\..+/, "Please provide a valid email address."],
            required: [true, "Email address is missing."]
        },
        phoneNo: {
            countryCode: { type: String },
            number: { type: Number, trim: true }
        },
        verified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = User = mongoose.model('users', userSchema);