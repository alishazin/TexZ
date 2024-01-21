
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
    
            if (!roomObj.messages) roomObj.messages = []

            
            for (let msgObj of roomObj.messages) {

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

            roomObj.messages.push({
                type: "msg",
                text: text,
                from: user._id,
                timestamp: new Date(),
                read_by: []
            })
    
            roomObj.markModified("messages")
            await roomObj.save()
    
            socket.to(room_id).emit("refresh_data", {})
    
            callback({status: "success"})
    
        })
    
        socket.on("edit_room_name_and_description", async (requestData, callback) => {
            
            const { room_id, room_name, room_description } = requestData
            
            const [user, roomObj, response] = await roomMiddlewares.verifyRoomParticipationSocket(requestData, UserModel, RoomModel, ['admin'])

            if (response.status !== "success") {
                return callback(response)
            }

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
                );
            } else if (roomObj.admin.toString() === user._id.toString()) {
                // user is the room admin
                await RoomModel.findOneAndUpdate(
                    { "messages._id": msg_id },
                    { $set: { 
                        "messages.$.type": "deleted_msg", 
                        "messages.$.timestamp" : new Date() 
                    }},
                    { safe: true, multi: false }
                );
            } else {
                // user is neither the admin nor the admin
                return callback({status: "unexpected_error"})
                
            }
            
            socket.to(room_id).emit("refresh_data", {})
            return callback({status: "success"})

        })
            
    })

}

/*
1. Add admin deleted msg
2. Add loading for send msg button
3. do the msg adding in other way, not .push
*/

module.exports = {initialize: initialize}