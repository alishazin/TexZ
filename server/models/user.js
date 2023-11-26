const mongoose = require("mongoose");

function initialize() {

    const userSchema = mongoose.Schema({
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        username: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: false,
        },
        verified: {
            type: Boolean,
            required: true,
        },
        provider: {
            type: String,
            enum: ['local', 'google'],
            required: true,
        },
        verification_token: {
            type: String,
            required: false
        },
        verification_timestamp: {
            type: Date,
            required: false
        }
    })

    const User = mongoose.model("User", userSchema)

    return User

}

module.exports = {initialize: initialize}