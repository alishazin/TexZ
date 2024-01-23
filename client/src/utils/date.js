
const getDayNameShort = {
    0: "SUN",
    1: "MON",
    2: "TUE",
    3: "WED",
    4: "THU",
    5: "FRI",
    6: "SAT",
    7: "SUN",
}

const getMonthNameShort = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec",
}

function checkIfDateTimeIsToday(date) {
    if (new Date().toDateString() == date.toDateString()) return true
    return false
}

function checkIfDateTimeIsYesterday(date) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
}

function getFormattedDate(date) {
    date = new Date(date)
    if (checkIfDateTimeIsToday(date)) return "Today"
    if (checkIfDateTimeIsYesterday(date)) return "Yesterday"
    return date.toLocaleDateString("en-GB", {
        year: "2-digit", 
        month: "2-digit", 
        day: "2-digit"
    })
    
}

function getFormattedTime(date) {
    date = new Date(date)
    let hour = date.getHours()
    let minute = date.getMinutes()

    hour = hour < 10 ? `0${hour}` : hour
    minute = minute < 10 ? `0${minute}` : minute
    return `${hour}:${minute}`
    
}

function addDateStamps(data, userId, unreadMsgRecord, selectedRoomId) {

    const returnData = []

    let prevDateString = null
    let unreadDivUsed = false
    let count = 0
    let unreadCountLast = null

    for (let messageObj of data) {

        const dateCurrent = new Date(messageObj.dateObj)
        const dateStringCurrent = new Date(messageObj.dateObj).toDateString()
        
        if (
            prevDateString !== dateStringCurrent
        ) {
            returnData.push({
                dayName: getDayNameShort[dateCurrent.getDay()],
                dateNum: dateCurrent.getDate(),
                monthName: getMonthNameShort[dateCurrent.getMonth()],
                type: "date"
            })

            count++
        }
        
        if (
            messageObj.type === "msg" && 
            (
                unreadMsgRecord.current[selectedRoomId] === messageObj._id || 
                (
                    messageObj.from._id !== userId && 
                    !messageObj.read_by.includes(userId) && 
                    !unreadDivUsed
                )
            )
        ) {
            unreadCountLast = count
            unreadMsgRecord.current[selectedRoomId] = messageObj._id
            unreadDivUsed = true
            returnData.push({
                type: "unread"
            })
            
            count++
        }
        
        returnData.push({
            ...messageObj
        })

        prevDateString = dateStringCurrent
        
        count++
    }

    if (unreadCountLast !== null) {
        returnData[unreadCountLast].isLast = true
    } else if (returnData.length > 0) {
        returnData[returnData.length - 1].isLast = true
    }

    return returnData
}

function sortChatByTime(data) {
    
    let count = 0
    for (let chatObj of data) {
        chatObj._index = count
        if (chatObj.past)
            chatObj.lastTimestamp = chatObj.dateObj
        else
            chatObj.lastTimestamp = chatObj.messages.length ? chatObj.messages[chatObj.messages.length - 1].dateObj : null
        count++
    }

    data.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());

    return data

}

export {
    getFormattedDate as formatDate,
    getFormattedTime as formatTime,
    addDateStamps,
    sortChatByTime
}