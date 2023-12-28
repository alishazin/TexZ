require('dotenv').config()
const PORT = process.env.PORT || 3000

const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

const userModel = require(`${__dirname}/models/user.js`);
const roomModel = require(`${__dirname}/models/room.js`);

const authViews = require(`${__dirname}/endpoints/auth.js`);
const roomViews = require(`${__dirname}/endpoints/room.js`);

// Initializing Database
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.gzebqbn.mongodb.net/?retryWrites=true&w=majority`);

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

// 404 Endpoint (Add at last)
app.use((req, res) => {
    res.status(404).send();
});

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
})