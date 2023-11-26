const mongoose = require("mongoose");

function initialize() {

    const userSchema = mongoose.Schema({
        email: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            required: true,
        },
        provider: {
            type: String,
            enum: ['local', 'google'],
            required: true,
        }
    })

    const User = mongoose.model("User", userSchema)

    return User

}

module.exports = {initialize: initialize}