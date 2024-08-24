
const mongoose = require("mongoose");
const utils = require(`../utils/utils.js`) 
const emailClient = require(`../utils/email.js`) 
const bcrypt = require("bcrypt")
const _ = require("lodash")
const jwtDecode = require("jwt-decode").jwtDecode
const roomMiddlewares = require(`../middlewares/room.js`)

function initialize(app, UserModel) {

    signUpEndpoint(app, UserModel);
    signUpGoogleEndpoint(app, UserModel);
    verifyEmailEndpoint(app, UserModel);
    logInEndpoint(app, UserModel);
    ChangePasswordEndpoint(app, UserModel);
    ResetPasswordEndpoint(app, UserModel);

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

function signUpGoogleEndpoint(app, UserModel) {

    app.post("/api/auth/signin/google", async (req, res) => {

        const { jwt_encoded } = req.body
        const jwt_decoded = jwtDecode(jwt_encoded)

        if (!jwt_decoded.email_verified) {
            return res.status(400).send({err_msg: "Email is not verified"})
        }

        const session_token = new mongoose.Types.ObjectId().toString();

        const obj = await UserModel.findOne({email: jwt_decoded.email, provider: "google", google_id: jwt_decoded.sub})
        if (obj) {

            obj.session_token = session_token
            await obj.save()

        } else {

            // check if local account exist

            const localUser = await UserModel.findOne({email: jwt_decoded.email, provider: "local"})
            if (localUser) {
                if (localUser.verified) {
                    return res.status(400).send({err_msg: "Use password to log in"})
                }
                
                if (utils.checkIfExpired(localUser.verification_timestamp)) {
                    await UserModel.findByIdAndDelete(localUser._id)
                } else {
                    return res.status(400).send({err_msg: "Verify your account using the link sent to you"})
                }
            }

            // if not, create google account
            
            const newUser = new UserModel({
                email: jwt_decoded.email,
                username: jwt_decoded.name,
                verified: true,
                provider: "google",
                google_id: jwt_decoded.sub,
                session_token: session_token
            })
            await newUser.save()

        }

        return res.status(200).send({
            session_token: session_token
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
        
        if (user.provider === "google") {
            return res.status(400).send({err_msg: "Use sign in with google"})
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
        if (!user) {
            console.log(session_token);
            return res.status(401).send({err_msg: "Invalid session_token"})
        }

        return res.status(200).send({
            _id: user._id,
            email: user.email,
            username: user.username,
            provider: user.provider
        })

    })

}

function ChangePasswordEndpoint(app, UserModel) {

    app.use("/api/auth/change-password", roomMiddlewares.verifySessionToken(app, UserModel))
    app.post("/api/auth/change-password", async (req, res) => {

        const { old_password, new_password } = req.body

        const user = res.locals.user
        
        if (user.provider === "google") {
            return res.status(400).send({err_msg: "Account with the given email is authenticated using google"})
        }

        const result = await bcrypt.compare(old_password, user.password);
        if (!result) {
            return res.status(400).send({err_msg: "Invalid old password"})
        }

        if (!utils.checkType(new_password, String) || new_password.length < 8) {
            return res.status(400).send({err_msg: "New Password must be 8 characters long"})
        }

        const hash = await bcrypt.hash(new_password, 10);

        user.password = hash
        await user.save()

        return res.status(200).send()

    })

}

function ResetPasswordEndpoint(app, UserModel) {

    app.post("/api/auth/forgot-password", async (req, res) => {

        const { email } = req.body

        const user = await UserModel.findOne({email: email?.toLowerCase(), verified: true})

        if (!user) {
            return res.status(400).send({err_msg: "Account with the given email does not exist"})
        }
        
        if (user.provider === "google") {
            return res.status(400).send({err_msg: "Account with the given email is authenticated using google"})
        }
        
        const resetpass_token = new mongoose.Types.ObjectId().toString()
        
        user.resetpass_token = resetpass_token
        await user.save()

        emailClient.sendResetPasswordEmail(user.email, _.startCase(user.username), resetpass_token)

        return res.status(200).send({
            email: user.email
        })

    })

    app.post("/api/auth/verify-resetpass-token", async (req, res) => {

        const { resetpass_token } = req.body

        const user = await UserModel.findOne({resetpass_token: resetpass_token, verified: true})

        if (!user) {
            return res.status(401).send({err_msg: "Invalid resetpass_token"})
        }
                
        return res.status(200).send({
            email: user.email
        })

    })

    app.post("/api/auth/reset-password", async (req, res) => {

        const { resetpass_token, new_password } = req.body

        const user = await UserModel.findOne({resetpass_token: resetpass_token, verified: true})

        if (!user) {
            return res.status(401).send({err_msg: "Invalid resetpass_token"})
        }

        if (!utils.checkType(new_password, String) || new_password.length < 8) {
            return res.status(400).send({err_msg: "New Password must be 8 characters long"})
        }

        const hash = await bcrypt.hash(new_password, 10);

        user.password = hash
        user.resetpass_token = null
        await user.save()
                
        return res.status(200).send()

    })

}

module.exports = {initialize: initialize}