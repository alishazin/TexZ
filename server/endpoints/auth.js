
const mongoose = require("mongoose");
const utils = require(`../utils/utils.js`) 
const emailClient = require(`../utils/email.js`) 
const bcrypt = require("bcrypt")
const _ = require("lodash")

function initialize(app, UserModel) {

    signUpEndpoint(app, UserModel);
    verifyEmailEndpoint(app, UserModel);
    logInEndpoint(app, UserModel);

}

function signUpEndpoint(app, UserModel) {

    app.post("/api/auth/signup", async (req, res) => {
        
        const { email, username, password } = req.body

        // email validation

        if (!email) {
            return res.status(400).send({err_msg: "Email is required"})
        }
        
        if (!utils.validateEmail(email)) {
            return res.status(400).send({err_msg: "Invalid email"})
        }
        
        const obj = await UserModel.findOne({email: email})
        if (obj) {

            if (obj.verified) {
                return res.status(400).send({err_msg: "User with same email exist!"})
            }
            
            if (utils.checkIfExpired(obj.verification_timestamp)) {
                await UserModel.findByIdAndDelete(obj._id)
            } else {
                return res.status(400).send({err_msg: "User with same email exist!"})
            }

        }

        if (!email) {
            return res.status(400).send({err_msg: "Email is required"})
        }
        
        if (!utils.checkType(username, String)) {
            return res.status(400).send({err_msg: "Username must be a text"})
        }

        // username check
        
        if (username.length < 3) {
            return res.status(400).send({err_msg: "Username must be atleast 3 characters"})
        }

        // password check

        if (!utils.checkType(password, String) || password.length < 8) {
            return res.status(400).send({err_msg: "Password must be 8 characters long"})
        }

        const hash = await bcrypt.hash(password, 10);
        const verification_token = new mongoose.Types.ObjectId().toString()

        const user = UserModel({
            email: email,
            username: username,
            password: hash,
            verified: false,
            provider: "local",
            verification_token: verification_token,
            verification_timestamp: new Date(),
        })

        await user.save()

        emailClient.sendVerificationEmail(user.email, _.startCase(user.username), verification_token)

        res.status(200).send({
            email: user.email,
            username: _.startCase(user.username)
        })
    })

}

function verifyEmailEndpoint(app, UserModel) {

    app.post("/api/auth/verify-account/", async (req, res) => {

        const { verification_token } = req.body

        const obj = await UserModel.findOne({verification_token: verification_token})
        if (!obj || utils.checkIfExpired(obj.verification_timestamp)) {
            return res.status(400).send({
                err_msg: "Invalid token."
            })
        }

        const session_token = new mongoose.Types.ObjectId().toString()

        obj.verified = true
        obj.verification_token = null
        obj.verification_timestamp = null
        obj.session_token = session_token
        await obj.save()

        return res.status(200).send({
            session_token: session_token
        })

    })

}

function logInEndpoint(app, UserModel) {

    app.post("/api/auth/login", async (req, res) => {

        const { email, password } = req.body

        const user = await UserModel.findOne({email: email?.toLowerCase(), verified: true})

        if (!user) {
            return res.status(400).send({err_msg: "Invalid credentials"})
        }
        
        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            return res.status(400).send({err_msg: "Invalid credentials"})
        }

        const session_token = new mongoose.Types.ObjectId().toString()
        user.session_token = session_token
        await user.save()

        return res.status(200).send({
            session_token: session_token
        })

    })

    app.post("/api/auth/validate-session", async (req, res) => {

        const { session_token } = req.body

        const user = await UserModel.findOne({session_token: session_token, verified: true})
        console.log(user);
        if (!user) {
            console.log("invalid");
            return res.status(400).send({err_msg: "Invalid session_token"})
        }

        return res.status(200).send({
            email: user.email,
            username: user.username
        })

    })

}

module.exports = {initialize: initialize}