
function getUnreadMsgCount(data, userId) {
    let count = 0

    for (let msgObj of data.messages) {

        if (msgObj.from._id !== userId && !msgObj.read_by.includes(userId))
            count++

    }

    return count
}

export {
    getUnreadMsgCount,
}