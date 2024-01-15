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

export {
    getFormattedDate as formatDate,
    getFormattedTime as formatTime
}