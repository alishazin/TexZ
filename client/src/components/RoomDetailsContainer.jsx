import "../styles/roomdetails.css"
import { Icon } from '@iconify/react'
import { useEffect, useState, useRef } from "react"
import TertiaryButton from "./TertiaryButton"
import ParticipantItem from "./ParticipantItem"
import ToggleButton from "./ToggleButton"

function RoomDetailsContainer({ setDetailsWidget, roomName, roomDescription }) {

    const isAdmin = true
    const [editState, setEditState] = useState(false)
    const [editedRoomName, setEditedRoomName] = useState(roomName)
    const [editedRoomDescription, setEditedRoomDescription] = useState(roomDescription)
    const allowParicipantsPrev = useRef(null)
    const [allowParicipants, setAllowParicipants] = useState(false)

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

    useEffect(() => {
        if (allowParicipantsPrev.current !== null) {
            console.log("change allow participants", allowParicipants);
        }
    }, [allowParicipants])

    return (
        <div className="room-details-container">
            <div className="top-section">
                <div className="left-area">
                    <Icon icon="ph:caret-left-bold" className="icon" onClick={() => setDetailsWidget(false)} />
                </div>
                {!editState && 
                <div className="right-area">
                    <div className="room-name">{roomName} {isAdmin && <Icon onClick={() => setEditState(true)} className="edit-button" icon="material-symbols:edit-outline" />}</div>
                    <div className="room-description">{roomDescription}</div>
                </div>
                }
                {(editState && isAdmin) && 
                <form className="right-area-edit" onSubmit={handleSubmit}>
                    <input onChange={handleChange} name="room-name" className="room-name" value={editedRoomName} /> <Icon onClick={cancelEdit} className="cancel-btn" icon="material-symbols:cancel-outline" /><br/>
                    <textarea className="room-description" onChange={handleChange} name="room-description">{editedRoomDescription}</textarea>
                    <TertiaryButton text="Confirm" disabled={false} />
                </form>
                }
            </div>
            <div className="participants-container">
                <h2>Participants</h2>
                <ParticipantItem name="Ali Shazin" isAdmin={isAdmin} />
                <ParticipantItem name="John Doe" isAdmin={isAdmin} />
                <ParticipantItem name="Vitor Roque" isAdmin={isAdmin} />
            </div>
            {isAdmin && <>
            <div className="roomcode-container">
                <h2>Room Code</h2>
                <div className="content-box">
                    <div className="left-area">
                        <span>fea926be-d7c9-4a68-b1fc-557a90ef6564</span>
                        <Icon onClick={() => navigator.clipboard.writeText("fea926be-d7c9-4a68-b1fc-557a90ef6564")} className="copy-icon" icon="fluent:copy-32-regular" />
                    </div>
                    <div className="right-area">
                        <TertiaryButton text={"Generate New"} disabled={false} /> 
                    </div>
                </div>
                <div className="info">Generating a new room code will result in making the older one invalid. Previously shared room code will no longer be valid.</div>
            </div>
            <div className="dangerzone-container">
                <h2>Danger Zone <Icon className="icon" icon="solar:danger-triangle-outline" /></h2>
                <div className="dismiss-container">
                    <div className="text">Dismiss the room<br/><span>( this change is irreversible )</span></div>
                    <div className="btn-area">
                        <TertiaryButton text={"Dismiss"} disabled={false} />
                    </div>
                </div>
                <div className="allow-container">
                    <div className="text">Allow participants joining</div>
                    <div className="toggle-area">
                        <ToggleButton prevValue={allowParicipantsPrev} disabled={false} state={allowParicipants} setState={setAllowParicipants} />
                    </div>
                </div>
            </div>
            </>}
        </div>
    )
}

export default RoomDetailsContainer