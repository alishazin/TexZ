const mongoose = require("mongoose");

function initialize() {

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
        participants: {
            type: [mongoose.Types.ObjectId]
        }
        
    })

    const Room = mongoose.model("Room", roomSchema)

    return Room

}

module.exports = {initialize: initialize}