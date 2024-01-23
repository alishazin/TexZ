
function getUnreadMsgCount(data, userId) {
    let count = 0

    const reversed = [...data.messages].reverse()

    for (let msgObj of reversed) {

        if (msgObj.type === "msg" && msgObj.from._id !== userId)
            if (!msgObj.read_by.includes(userId))
                count++
            else
                return count

    }

    return count
}

function getRoomIndexById(roomData, id) {
    let count = 0
    for (let roomObj of roomData) {
        if (roomObj._id === id) {
            return count
        } 
        count++
    }
}

export {
    getUnreadMsgCount,
    getRoomIndexById
}