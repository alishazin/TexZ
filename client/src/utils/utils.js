
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

export {
    getUnreadMsgCount,
}