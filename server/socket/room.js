
const mongoose = require("mongoose");
const utils = require(`../utils/utils.js`) 
const emailClient = require(`../utils/email.js`) 
const bcrypt = require("bcrypt")
const _ = require("lodash")
const roomMiddlewares = require(`../middlewares/room.js`)

function initialize(io, UserModel, RoomModel) {

    io.on("connection", async (socket) => {

        const session_token = socket.handshake.query.session_token
        const userChatData = await utils.getUsersChatData(UserModel, RoomModel, session_token)
        
        if (userChatData.status === "success") {
            const allRoomIds = []
            for (let roomObj of userChatData.roomData) {
                allRoomIds.push(roomObj._id.toString())
            }
            console.log("JOINING");
            socket.join(allRoomIds)
        }
    
        socket.emit("fetch_data", userChatData)
        console.log(io.sockets.adapter.rooms);
    
        socket.on("send_message", async (requestData, callback) => {
            
            const { room_id, text } = requestData

            const [user, roomObj, response] = await roomMiddlewares.verifyRoomParticipationSocket(requestData, UserModel, RoomModel, ['admin', 'participant'])

            if (response.status !== "success") {
                return callback(response)
            }

            if (roomObj.is_dismissed)
                return callback({status: "room_dismissed"})

            const newMessage = {
                type: "msg",
                text: text,
                from: user._id,
                timestamp: new Date(),
                read_by: []
            }

            await RoomModel.findOneAndUpdate(
                { _id: roomObj._id },
                { $push: { messages: newMessage } }
            )
    
            socket.to(room_id).emit("refresh_data", {special: "recieve_msg"})
    
            callback({status: "success"})
    
        })
    
        socket.on("edit_room_name_and_description", async (requestData, callback) => {
            
            const { room_id, room_name, room_description } = requestData
            
            const [user, roomObj, response] = await roomMiddlewares.verifyRoomParticipationSocket(requestData, UserModel, RoomModel, ['admin'])

            if (response.status !== "success") {
                return callback(response)
            }

            if (roomObj.is_dismissed)
                return callback({status: "room_dismissed"})

            roomObj.name = room_name
            roomObj.description = room_description
            await roomObj.save()

            socket.to(room_id).emit("refresh_data", {})
            
            callback({status: "success"})

        })
        
        socket.on("mark_as_read", async (requestData, callback) => {
            
            const { room_id } = requestData
            
            const [user, roomObj, response] = await roomMiddlewares.verifyRoomParticipationSocket(requestData, UserModel, RoomModel, ['admin', 'participant'])

            if (response.status !== "success") {
                return callback(response)
            }
            
            for (let msgObj of roomObj.messages) {
                
                if (msgObj.type === "msg") {
                    const readByIds = []
                    for (let read_by_obj of msgObj.read_by) {
                        readByIds.push(read_by_obj._id.toString())
                    }
                    if (!readByIds.includes(user._id.toString()) && msgObj.from.toString() !== user._id.toString()) {
                        readByIds.push(user._id.toString())
                        msgObj.read_by.push({
                            _id: user._id,
                            timestamp: new Date()
                        })
                    }
                }
            }
            
            roomObj.markModified("messages")
            await roomObj.save()
            
            socket.to(room_id).emit("refresh_data_after_read", {})
            
            callback({status: "success"})
            
        })
        
        socket.on("delete_message", async (requestData, callback) => {
            
            const { room_id, msg_id } = requestData
            
            const [user, roomObj, response] = await roomMiddlewares.verifyRoomParticipationSocket(requestData, UserModel, RoomModel, ['admin', 'participant'])

            if (response.status !== "success") {
                return callback(response)
            }

            const msgObj = utils.getMsgFromRoomObjById(roomObj, msg_id)

            if (msgObj.from.toString() === user._id.toString()) {
                
                // user is the msg sender
                await RoomModel.findOneAndUpdate(
                    { _id: roomObj._id },
                    { $pull: { messages: { _id: msg_id } } },
                    { safe: true, multi: false }
                )

            } else if (roomObj.admin.toString() === user._id.toString()) {
                
                // user is the room admin
                await RoomModel.findOneAndUpdate(
                    { "_id": roomObj._id, "messages._id": msg_id },
                    { $set: { 
                        "messages.$.type": "deleted_msg", 
                        "messages.$.timestamp" : new Date() 
                    }},
                    { safe: true, multi: false }
                )

            } else {

                // user is neither the admin nor the admin
                return callback({status: "unexpected_error"})
                
            }
            
            socket.to(room_id).emit("refresh_data", {})
            return callback({status: "success"})

        })

        socket.on("leave_room", async (requestData, callback) => {
            
            const { room_id } = requestData
            
            const [user, roomObj, response] = await roomMiddlewares.verifyRoomParticipationSocket(requestData, UserModel, RoomModel, ['participant'])

            if (response.status !== "success") {
                return callback(response)
            }

            if (roomObj.is_dismissed)
                return callback({status: "room_dismissed"})

            socket.leave(room_id)
            console.log("Leave", io.sockets.adapter.rooms);

            // Remove from roomObj.participants

            await RoomModel.findOneAndUpdate(
                { _id: roomObj._id },
                { $pull: { participants: user._id }},
                { safe: true, multi: false }
            )

            // Set from userObj.rooms.$.has_left = true

            await UserModel.findOneAndUpdate(
                { "_id": user._id, "rooms._id": roomObj._id },
                { $set: { "rooms.$.has_left": true } },
                { safe: true, multi: false }
            )

            // Add roomObj.past_rooms

            await UserModel.findOneAndUpdate(
                { _id: user._id },
                { $push: { past_rooms: {
                    _id: roomObj._id,
                    name: roomObj.name,
                    description: roomObj.description,
                    removed_or_left: "left",
                    timestamp: new Date()
                } }},
                { safe: true, multi: false }
            )

            // Add info message

            const infoObj = {
                type: "info_leave",
                from: user._id,
                timestamp: new Date()
            }

            await RoomModel.findOneAndUpdate(
                { _id: roomObj._id },
                { $push: { messages: infoObj } }
            )

            socket.to(room_id).emit("refresh_data", {})
            return callback({status: "success"})

        })
        
        socket.on("remove_participant", async (requestData, callback) => {
            
            const { room_id, participant_id } = requestData
            
            const [user, roomObj, response] = await roomMiddlewares.verifyRoomParticipationSocket(requestData, UserModel, RoomModel, ['admin'])

            if (response.status !== "success") {
                return callback(response)
            }

            if (roomObj.is_dismissed)
                return callback({status: "room_dismissed"})

            let found

            for (let participant_id_ of roomObj.participants) {
                if (participant_id_.toString() === participant_id) {
                    found = true
                    break
                }
            }

            if (!found)
                return callback(response)

            // Remove from roomObj.participants

            await RoomModel.findOneAndUpdate(
                { _id: roomObj._id },
                { $pull: { participants: participant_id }},
                { safe: true, multi: false }
            )

            // Set from userObj.rooms.$.is_removed = true

            await UserModel.findOneAndUpdate(
                { "_id": participant_id, "rooms._id": roomObj._id },
                { $set: { "rooms.$.is_removed": true } },
                { safe: true, multi: false }
            )

            // Add roomObj.past_rooms

            await UserModel.findOneAndUpdate(
                { _id: participant_id },
                { $push: { past_rooms: {
                    _id: roomObj._id,
                    name: roomObj.name,
                    description: roomObj.description,
                    removed_or_left: "removed",
                    timestamp: new Date()
                } }},
                { safe: true, multi: false }
            )

            // Add info message

            const infoObj = {
                type: "info_remove",
                from: user._id,
                timestamp: new Date()
            }

            await RoomModel.findOneAndUpdate(
                { _id: roomObj._id },
                { $push: { messages: infoObj } }
            )

            socket.to(room_id).emit("refresh_data_after_removal", {participant_id: participant_id})
            return callback({status: "success"})

        })
        
        socket.on("dismiss_room", async (requestData, callback) => {
            
            const { room_id } = requestData
            
            const [user, roomObj, response] = await roomMiddlewares.verifyRoomParticipationSocket(requestData, UserModel, RoomModel, ['admin'])

            if (response.status !== "success") {
                return callback(response)
            }

            if (roomObj.is_dismissed)
                return callback({status: "room_dismissed"})

            // Set is_dismissed = true

            await RoomModel.findOneAndUpdate(
                { _id: roomObj._id },
                { $set: { is_dismissed: true }},
                { safe: true, multi: false }
            )

            // Add info message

            const infoObj = {
                type: "info_dismiss",
                from: user._id,
                timestamp: new Date()
            }

            await RoomModel.findOneAndUpdate(
                { _id: roomObj._id },
                { $push: { messages: infoObj } }
            )

            socket.to(room_id).emit("refresh_data", {})
            return callback({status: "success"})

        })

        socket.on("disconnect", (reason) => {
            console.log("disconect: ", reason);
            console.log(io.sockets.adapter.rooms);
        });

        socket.on("disconnecting", (reason) => {
            console.log("disconnecting", socket.rooms);
            for (const room of socket.rooms) {
                console.log(room, socket.id);
                if (room !== socket.id) {
                    console.log("user has left", room);
                }
            }
        });
            
    })

}

module.exports = {initialize: initialize}