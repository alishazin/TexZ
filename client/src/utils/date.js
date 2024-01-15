
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

function addDateStamps(data) {

    const returnData = []

    let prevDateString = null

    for (let messageObj of data) {

        const dateCurrent = new Date(messageObj.dateObj)
        const dateStringCurrent = new Date(messageObj.dateObj).toDateString()
        
        if (prevDateString !== dateStringCurrent) {
            returnData.push({
                dayName: getDayNameShort[dateCurrent.getDay()],
                dateNum: dateCurrent.getDate(),
                monthName: getMonthNameShort[dateCurrent.getMonth()],
                type: "date"
            })
        }
        
        returnData.push({
            ...messageObj,
            type: "message"
        })

        prevDateString = dateStringCurrent
    }

    return returnData
}

export {
    getFormattedDate as formatDate,
    getFormattedTime as formatTime,
    addDateStamps
}