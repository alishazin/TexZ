
const mongoose = require("mongoose");
const utils = require(`../utils/utils.js`) 
const dateUtils = require(`../utils/date.js`) 
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

        user.rooms.push({_id: room._id, is_removed: false, has_left: false})
        user.markModified("rooms")
        await user.save()

        // Add info message
        
        const infoObj = {
            type: "info_create",
            from: user._id,
            timestamp: new Date()
        }

        await RoomModel.findOneAndUpdate(
            { _id: room._id },
            { $push: { messages: infoObj } }
        )

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
        
        const room = await RoomModel.findOne({room_id: room_code, allow_join: true, is_dismissed: false})
        if (!room) {
            return res.status(400).send({err_msg: "Room code is invalid"})
        }

        let pastJoined = false
        
        for (let embRoom of user.rooms) {
            if (embRoom._id.toString() === room._id.toString()) {
                if (!embRoom.is_removed && !embRoom.has_left) {
                    return res.status(400).send({err_msg: "You have already joined the room"})
                } else {
                    embRoom.is_removed = false
                    embRoom.has_left = false
                    pastJoined = true

                    // Remove from past_room

                    await UserModel.findOneAndUpdate(
                        { _id: user._id },
                        { $pull: { past_rooms: { _id: embRoom._id} }},
                        { safe: true, multi: false }
                    )

                    break
                }
            }
        }

        room.markModified("participants")
        room.participants.push(user._id)
        await room.save()

        if (!pastJoined)
            user.rooms.push({_id: room._id, is_removed: false, has_left: false})

        // Add info message
        
        const infoObj = {
            type: "info_join",
            from: user._id,
            timestamp: new Date()
        }

        await RoomModel.findOneAndUpdate(
            { _id: room._id },
            { $push: { messages: infoObj } }
        )

        user.markModified("rooms")
        await user.save()

        return res.status(200).send()
    })
    
    app.use("/api/room/:room_code/generate-roomcode", roomMiddlewares.verifyRoomParticipation(app, UserModel, RoomModel, ['admin']))
    app.post("/api/room/:room_code/generate-roomcode", async (req, res) => {

        if (res.locals.roomObj.is_dismissed) 
            return res.status(401).send({err_msg: "Room is dismissed"})

        res.locals.roomObj.room_id = new mongoose.Types.ObjectId()
        await res.locals.roomObj.save()

        return res.status(200).send()
    })
    
    app.use("/api/room/:room_code/toggle-allowjoin", roomMiddlewares.verifyRoomParticipation(app, UserModel, RoomModel, ['admin']))
    app.post("/api/room/:room_code/toggle-allowjoin", async (req, res) => {

        const { allow_join } = req.body

        if (res.locals.roomObj.is_dismissed) 
            return res.status(401).send({err_msg: "Room is dismissed"})

        res.locals.roomObj.allow_join = allow_join
        await res.locals.roomObj.save()

        return res.status(200).send({
            new_allow_join: allow_join
        })
    })

}

function chatEndpoint(app, UserModel, RoomModel) {

    app.use("/api/chat/get-all", roomMiddlewares.verifySessionToken(app, UserModel))
    app.get("/api/chat/get-all", async (req, res) => {

        const user = res.locals.user

        const result = await RoomModel.find({ 'admin': user._id })
            .select("name description admin participants room_id allow_join messages is_dismissed")

        result.push(
            ...await RoomModel.find({ 'participants': user._id })
            .select("name description admin participants messages is_dismissed")
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

            const messageDetails = []

            if (roomObj.messages) {
                for (let messageObj of roomObj.messages) {

                    const msgUserObj = await utils.getUserWithId(messageObj.from, UserModel)
                    
                    if (messageObj.type === "msg") {         

                        const allReadByData = []
                        const readByIds = []
                        for (let read_by_obj of messageObj.read_by) {
                            const msgUserObj = await utils.getUserWithId(read_by_obj._id, UserModel)
                            allReadByData.push({
                                _id: msgUserObj._id,
                                name: _.startCase(msgUserObj.username),
                                timestamp: dateUtils.getFormattedStamp(read_by_obj.timestamp)
                            })
                            readByIds.push(read_by_obj._id)
                        }

                        messageDetails.push({
                            _id: messageObj._id,
                            type: messageObj.type,
                            text: messageObj.text,
                            from: {
                                _id: msgUserObj._id.toString(),
                                username: _.startCase(msgUserObj.username),
                                email: msgUserObj.email,
                            },
                            stamp: dateUtils.getFormattedStamp(messageObj.timestamp),
                            dateObj: messageObj.timestamp,
                            read_by: readByIds,
                            read_by_data: allReadByData
                        })
                    
                    } else if (messageObj.type === "deleted_msg") {

                        messageDetails.push({
                            _id: messageObj._id,
                            type: messageObj.type,
                            from: {
                                _id: msgUserObj._id.toString()
                            },
                            stamp: dateUtils.getFormattedStamp(messageObj.timestamp),
                            dateObj: messageObj.timestamp
                        })

                    } else if (["info_leave", "info_join", "info_create", "info_remove", "info_dismiss"].includes(messageObj.type)) {

                        messageDetails.push({
                            _id: messageObj._id,
                            type: messageObj.type,
                            from: {
                                _id: msgUserObj._id.toString(),
                                username: _.startCase(msgUserObj.username),
                            },
                            stamp: dateUtils.getFormattedStamp(messageObj.timestamp),
                            dateObj: messageObj.timestamp
                        })
    
                    }
                }
            }

            const adminUserObj = await utils.getUserWithId(roomObj.admin, UserModel)

            returnResult.push({
                _id: roomObj._id.toString(),
                name: roomObj.name,
                description: roomObj.description,
                admin: {
                    _id: adminUserObj._id,
                    username: _.startCase(adminUserObj.username),
                    email: adminUserObj.email,
                },
                participants: participantsDetails,
                messages: messageDetails,
                room_id: roomObj.room_id ? roomObj.room_id : null,
                allow_join: roomObj.allow_join ? roomObj.allow_join : null,
                is_dismissed: roomObj.is_dismissed
            })
        }

        for (let pastRoomObj of user.past_rooms) {
            returnResult.push({
                _id: pastRoomObj._id,
                name: pastRoomObj.name,
                description: pastRoomObj.removed_or_left === "left" ? "You left the room" : "You were removed from the room",
                stamp: dateUtils.getFormattedStamp(pastRoomObj.timestamp),
                dateObj: pastRoomObj.timestamp,
                past: true
            })
        }

        return res.status(200).send({roomData: returnResult, userData: {
            _id: user._id,
            email: user.email,
            username: user.username,
            provider: user.provider
        }})

    })

}

module.exports = {initialize: initialize}