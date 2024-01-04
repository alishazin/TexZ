import "../styles/components/messagecontainer.css"

function MessageContainer({ side, msg, name, date, time }) {

    return (
        <div className={`single-message-container ${side}`}>
            <div className="msg-area">{msg}</div>
            <div className="details-area">
                <div className="name">{name}</div>
                <div className="date">{date}</div>
                <div className="time">{time}</div>
            </div>
        </div>
    )
}

export default MessageContainer;