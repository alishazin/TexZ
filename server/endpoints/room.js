
const mongoose = require("mongoose");
const utils = require(`../utils/utils.js`) 
const emailClient = require(`../utils/email.js`) 
const bcrypt = require("bcrypt")
const _ = require("lodash")

function initialize(app, UserModel, RoomModel) {

    roomEndpoint(app, UserModel, RoomModel);

}

function roomEndpoint(app, UserModel, RoomModel) {

    app.post("/api/room/create", async (req, res) => {
        
        const { session_token, name, description, allow_join } = req.body

        // session_token validation

        const user = await UserModel.findOne({session_token: session_token, verified: true})
        if (!user) {
            return res.status(401).send({err_msg: "Invalid session_token"})
        }

        // name validation
        
        if (!utils.checkType(name, String) || name.length < 3) {
            return res.status(400).send({err_msg: "Room name must be 3 characters long"})
        }
        
        // description validation
        
        if (!utils.checkType(description, String) || description.length < 3) {
            return res.status(400).send({err_msg: "Room description must be 3 characters long"})
        }

        // allow_join check
        
        if (!utils.checkType(allow_join, Boolean)) {
            return res.status(400).send({err_msg: "Invalid value from checkbox. Refresh the page!"})
        }

        const room = RoomModel({
            admin: user._id,
            name: name,
            description: description,
            allow_join: allow_join,
            room_id: new mongoose.Types.ObjectId().toString()
        })

        await room.save()

        user.rooms.push(room._id)
        user.markModified("rooms")
        await user.save()

        res.status(200).send({
            name: room.name,
            description: room.description,
            allow_join: room.allow_join,
            room_id: room.room_id
        })
    })
    
    app.post("/api/room/join", async (req, res) => {
        
        const { session_token, room_code } = req.body

        // session_token validation

        const user = await UserModel.findOne({session_token: session_token, verified: true})
        if (!user) {
            return res.status(401).send({err_msg: "Invalid session_token"})
        }

        // room_code validation
        
        const room = await RoomModel.findOne({room_id: room_code})
        if (!room) {
            return res.status(400).send({err_msg: "Room code is invalid"})
        }
        
        // check if user exist
        
        if (user.rooms.includes(room._id)) {
            return res.status(400).send({err_msg: "You have already joined the room"})
        }

        room.markModified("participants")
        room.participants.push(user._id)
        await room.save()

        user.rooms.push(room._id)
        user.markModified("rooms")
        await user.save()

        res.status(200).send()
    })

}

module.exports = {initialize: initialize}