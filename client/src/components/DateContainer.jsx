import "../styles/components/datecontainer.css"

function DateContainer({ day, date, month }) {

    return (
        <div className="date-container">
            <div className="day">{day}</div>
            <div className="date">{date}</div>
            <div className="month">{month}</div>
        </div>
    )
}

export default DateContainer;