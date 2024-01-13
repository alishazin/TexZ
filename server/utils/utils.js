
const _ = require("lodash")
const mongoose = require("mongoose")

const typeOf = (obj) => {
    return Object.getPrototypeOf(obj).constructor;
}

function checkType(value, type) {

    try {
        if (typeOf(value) === type) return true
        return false
    } catch(err) {
        // null will return false
        return false
    }
    
}

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function checkIfExpired(timestamp) {
    return (new Date().getTime() - timestamp.getTime()) > 10 * 60000
}

async function getUserWithId(id, UserModel) {

    return await UserModel.findOne({ _id: id })

}

async function getRoomWithId(id, RoomModel) {

    return await RoomModel.findOne({ _id: id })

}

async function getRoomWithIdAndUser(id, userObj, RoomModel, allowed_users) {

    const orQuery = []

    if (allowed_users.includes("admin"))
        orQuery.push({ admin: userObj._id })
    if (allowed_users.includes("participant"))
        orQuery.push({ participants: [userObj._id] })

    try {
        const roomObj = await RoomModel.findOne({ _id: id, $or: orQuery})

        return roomObj
    } catch(err) {
        console.log(err)
        return null
    }

}

async function getUserFromSessionToken(session_token, UserModel) {
    return await UserModel.findOne({session_token: session_token, verified: true})
}

async function getUsersChatData(UserModel, RoomModel, session_token) {

    // session_token validation
    const user = await getUserFromSessionToken(session_token, UserModel)
    if (!user) {
        return {status: "invalid_session_token", roomData: null, userData: null}
    }

    const result = await RoomModel.find({ 'admin': user._id })
        .select("name description admin participants room_id messages")

    result.push(
        ...await RoomModel.find({ 'participants': [user._id] })
        .select("name description admin participants messages")
    )

    const returnResult = []

    for (let roomObj of result) {
        
        const participantsDetails = []

        for (let participant_id of roomObj.participants) {
            const userObj = await getUserWithId(participant_id, UserModel)
            participantsDetails.push({
                _id: userObj._id.toString(),
                username: _.startCase(userObj.username),
                email: userObj.email,
            })
        }
        
        const messageDetails = []
        
        if (roomObj.messages) {
            for (let messageObj of roomObj.messages) {
                const msgUserObj = await getUserWithId(messageObj.from, UserModel)
                messageDetails.push({
                    text: messageObj.text,
                    from: {
                        _id: msgUserObj._id.toString(),
                        username: _.startCase(msgUserObj.username),
                        email: msgUserObj.email,
                    }
                })
            }
        }

        const adminUserObj = await getUserWithId(roomObj.admin, UserModel)

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
            room_id: roomObj.room_id ? roomObj.room_id : null
        })
    }

    return {status: "success", roomData: returnResult, userData: {
        _id: user._id,
        email: user.email,
        username: user.username,
        provider: user.provider
    }}
}

module.exports = {
    checkType: checkType, 
    validateEmail: validateEmail, 
    checkIfExpired: checkIfExpired,
    getUserWithId: getUserWithId,
    getRoomWithId: getRoomWithId,
    getUsersChatData: getUsersChatData,
    getUserFromSessionToken: getUserFromSessionToken,
    getRoomWithIdAndUser: getRoomWithIdAndUser
}