require('dotenv').config()
const PORT = process.env.PORT || 3000

const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http")
const { Server } = require("socket.io")

const utils = require(`${__dirname}/utils/utils.js`)

const userModel = require(`${__dirname}/models/user.js`);
const roomModel = require(`${__dirname}/models/room.js`);

const authViews = require(`${__dirname}/endpoints/auth.js`);
const roomViews = require(`${__dirname}/endpoints/room.js`);

// Initializing Database
// mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.gzebqbn.mongodb.net/?retryWrites=true&w=majority`);
mongoose.connect(`mongodb://127.0.0.1:27017/TexZ`);

// Initializing Express App
const app = express();
app.use(cors());
app.use(express.json());

// Initializing Models
const UserModel = userModel.initialize()
const RoomModel = roomModel.initialize()

// Initializing Endpoints
authViews.initialize(app, UserModel)
roomViews.initialize(app, UserModel, RoomModel)

// Initializing Socket.io
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:8000",
        methods: ["GET", "POST"]
    }
})

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
        
        const { userId, roomId, text } = requestData

        // Do validation, and send status in callback
        // check session_token during send_message
        // make different types of messages. Leaving group, joined group, etc..
        // date widgets are auto-generated
        // Do stuffs for removing a member from a group
        // const userObj = utils.getUserWithId(userId, UserModel)
        const roomObj = await utils.getRoomWithId(roomId, RoomModel)

        if (!roomObj.messages) roomObj.messages = []
        
        roomObj.messages.push({
            text: text,
            from: userId
        })

        roomObj.markModified("messages")
        await roomObj.save()

        socket.to(roomId).emit("refresh_data", {})

        callback()

    })

})

// 404 Endpoint (Add at last)
app.use((req, res) => {
    res.status(404).send();
});

server.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
})