import { Icon } from "@iconify/react"
import "../styles/components/readbypopup.css"
import { useState } from "react"

function ReadByPopup({ popupObj, setPopupObj, userObj }) {

    const closePopup = () => {
        setPopupObj({
            state: false,
            data: null,
            msg_id: null,
        })
    }

    const handleParentClick = (e) => {
        if (e.target === e.currentTarget) closePopup()
    }

    return (
        <div className="readby-popup-container" onClick={handleParentClick}>
            <div className="popup-content">
                <div className="header"><Icon icon="solar:check-read-line-duotone" className="icon" />Read By</div>
                {popupObj.data.length > 0 ?
                popupObj.data.map((participant_data, _index) => (
                    <div key={_index} className="participant-item">
                        <div className="name">{participant_data._id === userObj._id && <span className="you">You</span>}{participant_data.name}</div>
                        <div className="time">{participant_data.timestamp}</div>
                    </div>
                ))
                :
                <div className="unread-box">
                    <Icon icon="solar:check-read-broken" className="icon" />
                    <span>No readers yet!</span>
                </div>
                }
            </div>
        </div>
    )
}

export default ReadByPopup;