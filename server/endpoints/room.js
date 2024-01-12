
const mongoose = require("mongoose");
const utils = require(`../utils/utils.js`) 
const emailClient = require(`../utils/email.js`) 
const bcrypt = require("bcrypt")
const _ = require("lodash")
const roomMiddlewares = require(`../middlewares/room.js`)

function initialize(app, UserModel, RoomModel) {

    roomEndpoint(app, UserModel, RoomModel);
    chatEndpoint(app, UserModel, RoomModel);

}

function roomEndpoint(app, UserModel, RoomModel) {

    app.use("/api/room/create", roomMiddlewares.verifySessionToken(app, UserModel))
    app.post("/api/room/create", async (req, res) => {
        
        const user = res.locals.user

        const { name, description, allow_join } = req.body

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
    
    app.use("/api/room/join", roomMiddlewares.verifySessionToken(app, UserModel))
    app.post("/api/room/join", async (req, res) => {
        
        const user = res.locals.user

        const { room_code } = req.body

        // room_code validation
        
        const room = await RoomModel.findOne({room_id: room_code, allow_join: true})
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

        return res.status(200).send()
    })

}

function chatEndpoint(app, UserModel, RoomModel) {

    app.use("/api/chat/get-all", roomMiddlewares.verifySessionToken(app, UserModel))
    app.get("/api/chat/get-all", async (req, res) => {

        const user = res.locals.user

        const result = await RoomModel.find({ 'admin': user._id })
            .select("name description admin participants room_id")

        result.push(
            ...await RoomModel.find({ 'participants': [user._id] })
            .select("name description admin participants")
        )

        const returnResult = []

        for (let roomObj of result) {
            
            const participantsDetails = []

            for (let participant_id of roomObj.participants) {
                const userObj = await utils.getUserWithId(participant_id, UserModel)
                participantsDetails.push({
                    _id: userObj._id.toString(),
                    username: _.startCase(userObj.username),
                    email: userObj.email,
                })
            }

            const adminUserObj = await utils.getUserWithId(roomObj.admin, UserModel)

            returnResult.push({
                name: roomObj.name,
                description: roomObj.description,
                admin: {
                    _id: adminUserObj._id,
                    username: _.startCase(adminUserObj.username),
                    email: adminUserObj.email,
                },
                participants: participantsDetails,
                room_id: roomObj.room_id ? roomObj.room_id : null
            })
        }

        return res.status(200).send(returnResult)

    })

}

module.exports = {initialize: initialize}