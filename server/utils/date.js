
function getDayHourMinute(date) {

    const today = new Date()

    const diffMs = (today - date)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000)
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000)

    return [diffDays, diffHrs, diffMins]
}

function getFormattedStamp(date) {
    
    const [days, hrs, mins] = getDayHourMinute(date)

    if (days === 0) {
        if (hrs === 0) {
            if (mins === 0) {
                return "now"
            } else {
                return `${mins} ${mins === 1 ? "min" : "mins"}`
            }
        } else {
            return `${hrs} ${hrs === 1 ? "hour" : "hours"}`
        }
    } else if (days < 7) {
        return `${days} ${days === 1 ? "day" : "days"}`
    } else if (days < 30) {
        return `${Math.floor(days / 7)} ${Math.floor(days / 7) === 1 ? "week" : "weeks"}`
    } else if (days < 365) {
        if (Math.floor(days / 30) < 12)
            return `${Math.floor(days / 30)} ${Math.floor(days / 30) === 1 ? "month" : "months"}`
        else
            return `1 year`
    } else {
        return `${Math.floor(days / 365)} ${Math.floor(days / 365) === 1 ? "year" : "years"}`
    }

}

module.exports = {
    getFormattedStamp: getFormattedStamp,
}