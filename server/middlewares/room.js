
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

async function verifyRoomParticipationSocket(requestData, UserModel, RoomModel, allowed_users) {

    const { session_token, room_id } = requestData

    const user = await utils.getUserFromSessionToken(session_token, UserModel)
    if (!user) {
        console.log("1");
        return [null, null, {status: "invalid_session_token"}]
    }
    
    const roomObj = await utils.getRoomWithIdAndUser(room_id, user, RoomModel, allowed_users)
    if (!roomObj) {
        console.log("2");
        return [null, null, {status: "unexpected_error"}]
    }

    return [user, roomObj, {status: "success"}]

}

module.exports = {
    verifySessionToken: verifySessionToken, 
    verifyRoomParticipationSocket: verifyRoomParticipationSocket
}