import "../styles/components/messagecontainer.css"
import { Icon } from '@iconify/react'

function MessageContainer({ side, msg, name, date, time, read_by_data, setPopupObj }) {

    const handleInfoClick = () => {
        setPopupObj({
            state: true,
            data: read_by_data
        })
    }

    return (
        <div className={`single-message-container ${side}`}>
            {side === "right" && <div className="transparent-area">
                <div className="box"><Icon icon="material-symbols:delete-outline" className="icon" /></div>
                <div className="box"><Icon onClick={handleInfoClick} icon="material-symbols:info-outline" className="icon" /></div>
            </div>}
            <div className="opaque-area">
                <div className="msg-area">{msg}</div>
                <div className="details-area">
                    <div className="name">{name}</div>
                    <div className="date">{date}</div>
                    <div className="time">{time}</div>
                </div>
            </div>
            {side === "left" && <div className="transparent-area">
                <Icon onClick={handleInfoClick} icon="material-symbols:info-outline" className="icon" />
            </div>}
        </div>
    )
}

export default MessageContainer;