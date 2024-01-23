const mongoose = require("mongoose");

function initialize() {

    const embeddedRoomSchema = mongoose.Schema({
        _id: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        is_removed: {
            type: Boolean,
            required: true
        },
        has_left: {
            type: Boolean,
            required: true
        },
        // any one will be true, or neither
    })

    const pastRoomSchema = mongoose.Schema({
        _id: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        removed_or_left: {
            type: String,
            required: true,
            enum: ["removed", "left"]
        },
        timestamp: {
            type: Date,
            required: true
        }
    })

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
            required: false,
        },
        session_token: {
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
        resetpass_token: {
            type: String,
            required: false
        },
        verification_timestamp: {
            type: Date,
            required: false
        },
        google_id: {
            type: String,
            required: false
        },
        rooms: {
            type: [embeddedRoomSchema]
        },
        past_rooms: {
            type: [pastRoomSchema],
            required: true
        }
    })

    const User = mongoose.model("User", userSchema)

    return User

}

module.exports = {initialize: initialize}