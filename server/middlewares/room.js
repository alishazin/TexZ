
const utils = require("../utils/utils.js")

function verifySessionToken(app, UserModel) {

    return async function (req, res, next) {

        const session_token = req.headers['session-token']

        // session_token validation

        const user = await UserModel.findOne({session_token: session_token, verified: true})
        if (!user) {
            return res.status(401).send({err_msg: "Invalid session_token"})
        }

        res.locals.user = user
        return next()

    }

}

function verifyRoomParticipation(app, UserModel, RoomModel, allowed_users) {

    return async function (req, res, next) {

        const { room_code } = req.params
        const session_token = req.headers['session-token']

        const user = await utils.getUserFromSessionToken(session_token, UserModel)
        if (!user) {
            return res.status(401).send({err_msg: "Invalid session_token"})
        }
        
        const roomObj = await utils.getRoomWithIdAndUser(room_code, user, RoomModel, allowed_users)
        if (!roomObj) {
            return res.status(401).send({err_msg: "User is not allowed here"})
        }

        res.locals.user = user
        res.locals.roomObj = roomObj
        
        return next()

    }

}

async function verifyRoomParticipationSocket(requestData, UserModel, RoomModel, allowed_users) {

    const { session_token, room_id } = requestData

    const user = await utils.getUserFromSessionToken(session_token, UserModel)
    if (!user) {
        return [null, null, {status: "invalid_session_token"}]
    }
    
    const roomObj = await utils.getRoomWithIdAndUser(room_id, user, RoomModel, allowed_users)
    if (!roomObj) {
        return [null, null, {status: "unexpected_error"}]
    }

    return [user, roomObj, {status: "success"}]

}

module.exports = {
    verifySessionToken: verifySessionToken, 
    verifyRoomParticipation: verifyRoomParticipation,
    verifyRoomParticipationSocket: verifyRoomParticipationSocket
}