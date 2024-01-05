import "../styles/roomdetails.css"
import { Icon } from '@iconify/react'
import { useState } from "react"
import TertiaryButton from "./TertiaryButton"

function RoomDetailsContainer({ setDetailsWidget, roomName, roomDescription }) {

    const [editState, setEditState] = useState(false)
    const [editedRoomName, setEditedRoomName] = useState(roomName)
    const [editedRoomDescription, setEditedRoomDescription] = useState(roomDescription)

    const handleChange = function (event) {
        if (event.target.name === "room-name") setEditedRoomName(event.target.value)
        else if (event.target.name === "room-description") setEditedRoomDescription(event.target.value)
    }

    const cancelEdit = function () {
        setEditedRoomName(roomName)
        setEditedRoomDescription(roomDescription)
        setEditState(false)
    }

    const handleSubmit = function (e) {
        e.preventDefault()
    }

    return (
        <div className="room-details-container">
            <div className="top-section">
                <div className="left-area">
                    <Icon icon="ph:caret-left-bold" className="icon" onClick={() => setDetailsWidget(false)} />
                </div>
                {!editState && 
                <div className="right-area">
                    <div className="room-name">{roomName} <Icon onClick={() => setEditState(true)} className="edit-button" icon="material-symbols:edit-outline" /></div>
                    <div className="room-description">{roomDescription}</div>
                </div>
                }
                {editState && 
                <form className="right-area-edit" onSubmit={handleSubmit}>
                    <input onChange={handleChange} name="room-name" className="room-name" value={editedRoomName} /> <Icon onClick={cancelEdit} className="cancel-btn" icon="material-symbols:cancel-outline" /><br/>
                    <textarea className="room-description" onChange={handleChange} name="room-description">{editedRoomDescription}</textarea>
                    <TertiaryButton text="Confirm" disabled={false} />
                </form>
                }
            </div>
        </div>
    )
}

export default RoomDetailsContainer