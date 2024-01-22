const mongoose = require("mongoose");

function initialize() {

    const messageSchema = mongoose.Schema({
        type: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            trim: true,
            required: true,
        },
        from: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        timestamp: {
            required: true,
            type: Date,
        },
        read_by: {
            required: true,
            type: [{
                user_id: mongoose.Types.ObjectId,
                timestamp: Date
            }]
        }
    })

    const participantSchema = mongoose.Schema({
        _id : {
            type: mongoose.Types.ObjectId,
            required: true
        },
        is_removed: {
            type: Boolean,
            required: true
        }
    })

    const roomSchema = mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            required: true,
        },
        allow_join: {
            type: Boolean,
            required: true,
        },
        room_id: {
            type: String,
            required: true
        },
        admin: {
            type: mongoose.Types.ObjectId,
            required: true
        }, // not added in participants
        participants: {
            type: [participantSchema]
        },
        messages: {
            type: [messageSchema],
            required: true
        }
        
    })

    const Room = mongoose.model("Room", roomSchema)

    return Room

}

module.exports = {initialize: initialize}