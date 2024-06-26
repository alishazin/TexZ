
const _ = require("lodash")
const mongoose = require("mongoose")
const dateUtils = require("./date.js")

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
        orQuery.push({ participants: userObj._id })

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
        .select("name description admin participants room_id allow_join messages is_dismissed")

    result.push(
        ...await RoomModel.find({ 'participants': user._id })
        .select("name description admin participants messages is_dismissed")
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
               
                if (messageObj.type === "msg") {     
                    
                    const allReadByData = []
                    const readByIds = []
                    for (let read_by_obj of messageObj.read_by) {
                        const msgUserObj = await getUserWithId(read_by_obj._id, UserModel)
                        allReadByData.push({
                            _id: msgUserObj._id,
                            name: _.startCase(msgUserObj.username),
                            timestamp: dateUtils.getFormattedStamp(read_by_obj.timestamp)
                        })
                        readByIds.push(read_by_obj._id)
                    }
    
                    messageDetails.push({
                        _id: messageObj._id,
                        type: messageObj.type,
                        text: messageObj.text,
                        from: {
                            _id: msgUserObj._id.toString(),
                            username: _.startCase(msgUserObj.username),
                            email: msgUserObj.email,
                        },
                        stamp: dateUtils.getFormattedStamp(messageObj.timestamp),
                        dateObj: messageObj.timestamp,
                        read_by: readByIds,
                        read_by_data: allReadByData
                    })

                } else if (messageObj.type === "deleted_msg") {

                    messageDetails.push({
                        _id: messageObj._id,
                        type: messageObj.type,
                        from: {
                            _id: msgUserObj._id.toString()
                        },
                        stamp: dateUtils.getFormattedStamp(messageObj.timestamp),
                        dateObj: messageObj.timestamp
                    })

                } else if (["info_leave", "info_join", "info_create", "info_remove", "info_dismiss"].includes(messageObj.type)) {

                    messageDetails.push({
                        _id: messageObj._id,
                        type: messageObj.type,
                        from: {
                            _id: msgUserObj._id.toString(),
                            username: _.startCase(msgUserObj.username),
                        },
                        stamp: dateUtils.getFormattedStamp(messageObj.timestamp),
                        dateObj: messageObj.timestamp
                    })

                }
            }
        }

        const adminUserObj = await getUserWithId(roomObj.admin, UserModel)

        returnResult.push({
            _id: roomObj._id,
            name: roomObj.name,
            description: roomObj.description,
            admin: {
                _id: adminUserObj._id,
                username: _.startCase(adminUserObj.username),
                email: adminUserObj.email,
            },
            participants: participantsDetails,
            messages: messageDetails,
            room_id: roomObj.room_id ? roomObj.room_id : null,
            allow_join: roomObj.room_id ? roomObj.allow_join : null,
            is_dismissed: roomObj.is_dismissed
        })
    }

    for (let pastRoomObj of user.past_rooms) {
        returnResult.push({
            _id: pastRoomObj._id,
            name: pastRoomObj.name,
            // description: pastRoomObj.description,
            description: pastRoomObj.removed_or_left === "left" ? "You left the room" : "You were removed from the room",
            stamp: dateUtils.getFormattedStamp(pastRoomObj.timestamp),
            past: true
        })
    }

    return {status: "success", roomData: returnResult, userData: {
        _id: user._id,
        email: user.email,
        username: user.username,
        provider: user.provider
    }}
}

function getMsgFromRoomObjById(roomObj, msgId) {
    for (let msgObj of roomObj.messages) {
        if (msgObj._id.toString() === msgId) {
            return msgObj
        }
    }
    return null
}

module.exports = {
    checkType: checkType, 
    validateEmail: validateEmail, 
    checkIfExpired: checkIfExpired,
    getUserWithId: getUserWithId,
    getRoomWithId: getRoomWithId,
    getUsersChatData: getUsersChatData,
    getUserFromSessionToken: getUserFromSessionToken,
    getRoomWithIdAndUser: getRoomWithIdAndUser,
    getMsgFromRoomObjById: getMsgFromRoomObjById
}