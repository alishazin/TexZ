
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
                allRoomIds.push(roomObj._id)
            }
            socket.join(allRoomIds)
        }
    
        socket.emit("fetch_data", userChatData)
        console.log(io.sockets.adapter.rooms);
    
        socket.on("send_message", async (requestData, callback) => {
            
            const { room_id, text } = requestData
    
            // make different types of messages. Leaving group, joined group, etc..
            // date widgets are auto-generated
            // Do stuffs for removing a member from a group

            const [user, roomObj, response] = await roomMiddlewares.verifyRoomParticipationSocket(requestData, UserModel, RoomModel, ['admin', 'participant'])

            if (response.status !== "success") {
                return callback(response)
            }
    
            if (!roomObj.messages) roomObj.messages = []

            for (let msgObj of roomObj.messages) {
                if (!msgObj.read_by.includes(user._id) && msgObj.from.toString() !== user._id.toString())
                    msgObj.read_by.push(user._id)
            }

            roomObj.messages.push({
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
                if (!msgObj.read_by.includes(user._id) && msgObj.from._id !== user._id)
                    msgObj.read_by.push(user._id)
            }

            roomObj.markModified("messages")
            await roomObj.save()

            socket.to(room_id).emit("refresh_data_after_read", {exclude_id: user._id})
            
            callback({status: "success"})

        })
    
    })

}

module.exports = {initialize: initialize}