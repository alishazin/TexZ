import "../styles/roomdetails.css"
import { Icon } from '@iconify/react'
import { useEffect, useState, useRef } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import TertiaryButton from "./TertiaryButton"
import ParticipantItem from "./ParticipantItem"
import ToggleButton from "./ToggleButton"
import axios from "axios"

function RoomDetailsContainer({ setDetailsWidget, roomId, roomName, roomDescription, roomCode, allowJoin, isAdmin, participants, adminUser, setPopupObj, getRoomData, socket, isDismissed, setSelectedRoomId }) {
    
    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [editState, setEditState] = useState(false)
    const [editedRoomName, setEditedRoomName] = useState(roomName)
    const [editedRoomDescription, setEditedRoomDescription] = useState(roomDescription)
    const [allowParicipants, setAllowParicipants] = useState(allowJoin)
    const [toggleDisabled, setToggleDisabled] = useState(false)
    const [editButtonLoadingState, setEditButtonLoadingState] = useState(false)
    const [editButtonDisabledState, setEditButtonDisabledState] = useState(true)

    const navigate = useNavigate()
    const session_token = cookies.session_token

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
        if (editedRoomName.trim() !== roomName.trim() || editedRoomDescription.trim() !== roomDescription.trim() )
            setEditButtonDisabledState(false)
        else 
            setEditButtonDisabledState(true)
    }, [editedRoomName, editedRoomDescription, roomName, roomDescription])

    const handleEdit = (e) => {
        e.preventDefault()

        if (!editButtonLoadingState && !editButtonDisabledState) {
            setEditButtonLoadingState(true)
            socket.emit("edit_room_name_and_description", { 
                session_token: session_token,
                room_id: roomId,
                room_name: editedRoomName,
                room_description: editedRoomDescription
            }, async function (data) {
                if (data.status !== "success") {
                    removeCookie("session_token")
                    navigate("/login?i=0")
                } else {
                    await getRoomData()
                    setEditButtonLoadingState(false)
                    setEditState(false)
                }
            })
        }
    }

    const generateNewRoomCode = async function () {
        if (!session_token) {
            navigate("/login?i=0")
            return;
        }
        
        try {
            await axios.post(`http://localhost:3000/api/room/${roomId}/generate-roomcode`, {}, {
                headers: {
                    "session-token": session_token
                }
            })
        } catch(err) {
            if (err.response.status === 401) {
                removeCookie("session_token")
                navigate("/login?i=0")
            }
            console.log(err);
        }
    }

    const toggleAllowJoin = async function() {
        if (toggleDisabled) return;

        if (!session_token) {
            navigate("/login?i=0")
            return;
        }
        
        try {
            setToggleDisabled(true)
            const response = await axios.post(`http://localhost:3000/api/room/${roomId}/toggle-allowjoin`, {
                allow_join: !allowParicipants,
            }, {
                headers: {
                    "session-token": session_token
                }
            })
            await getRoomData();
            setToggleDisabled(false)
            setAllowParicipants(response.data.new_allow_join)
        } catch(err) {
            if (err.response.status === 401) {
                removeCookie("session_token")
                navigate("/login?i=0")
            }
            console.log(err);
        }
    }

    return (
        <div className="room-details-container">
            <div className="top-section">
                <div className="left-area">
                    <Icon icon="ph:caret-left-bold" className="icon" onClick={() => setDetailsWidget(false)} />
                </div>
                {!editState && 
                <div className="right-area">
                    <div className="room-name">{roomName} {isAdmin && !isDismissed && <Icon onClick={() => setEditState(true)} className="edit-button" icon="material-symbols:edit-outline" />}</div>
                    <div className="room-description">{roomDescription}</div>
                </div>
                }
                {(editState && isAdmin) && 
                <form className="right-area-edit" onSubmit={handleSubmit}>
                    <input autoComplete="off" onChange={handleChange} name="room-name" className="room-name" value={editedRoomName} /> <Icon onClick={cancelEdit} className="cancel-btn" icon="material-symbols:cancel-outline" /><br/>
                    <textarea autoComplete="off" className="room-description" onChange={handleChange} name="room-description" value={editedRoomDescription}></textarea>
                    <TertiaryButton onClick={handleEdit} text="Confirm" disabled={editButtonDisabledState} loading={editButtonLoadingState} />
                </form>
                }
            </div>
            <div className="participants-container">
                <h2>Participants</h2>
                <ParticipantItem name={adminUser.username} isAdmin={isAdmin} adminIcon={true} />
                {participants.map((participantObj, _index) => (
                    <ParticipantItem key={_index} id={participantObj._id} name={participantObj.username} isAdmin={isAdmin} setPopupObj={setPopupObj} getRoomData={getRoomData} room_id={roomId} socket={socket} isDismissed={isDismissed} />
                ))}
            </div>
            {isAdmin && !isDismissed &&
            <div className="roomcode-container">
                <h2>Room Code</h2>
                <div className="content-box">
                    <div className="left-area">
                        <span>{roomCode}</span>
                        <Icon onClick={() => navigator.clipboard.writeText(roomCode)} className="copy-icon" icon="fluent:copy-32-regular" />
                    </div>
                    <div className="right-area">
                        <TertiaryButton text={"Generate New"} disabled={false} onClick={() => setPopupObj({
                            state: true,
                            text: `Read the consequences carefully before generating new room code.`,
                            confirmation_text: "generate new",
                            button_text: "Generate",
                            callback: async () => {
                                await generateNewRoomCode()
                                await getRoomData()
                            }
                        })} /> 
                    </div>
                </div>
                <div className="info">Generating a new room code will result in making the older one invalid. Previously shared room code will no longer be valid.</div>
            </div>}
            {!isDismissed && <>
            <div className="dangerzone-container">
                <h2>Danger Zone <Icon className="icon" icon="solar:danger-triangle-outline" /></h2>
                {isAdmin ? <>
                <div className="dismiss-container">
                    <div className="text">Dismiss the room<br/><span>( this change is irreversible )</span></div>
                    <div className="btn-area">
                        <TertiaryButton text={"Dismiss"} disabled={false} onClick={() => setPopupObj({
                            state: true,
                            text: `No one will be able to send message or edit room details after dismissal.`,
                            confirmation_text: "i understand",
                            button_text: "Dismiss the Room",
                            callback: async () => {
                                return new Promise(res => {
                                    socket.emit("dismiss_room", { 
                                        session_token: session_token,
                                        room_id: roomId
                                    }, async function (data) {
                                        if (data.status !== "success") {
                                            removeCookie("session_token")
                                            navigate("/login?i=0")
                                        } else {
                                            // setDetailsWidget(false)
                                            // setSelectedRoomId(null)
                                            await getRoomData()
                                            res()
                                        }
                                    })
                                })
                            }
                        })} />
                    </div>
                </div>
                <div className="allow-container">
                    <div className="text">Allow participants joining</div>
                    <div className="toggle-area">
                        <ToggleButton disabled={toggleDisabled} state={allowParicipants} handleClick={toggleAllowJoin}  />
                    </div>
                </div>
                </> :
                <div className="dismiss-container">
                    <div className="text">Leave the room<br/><span>( Your messages won't be deleted )</span></div>
                    <div className="btn-area">
                        <TertiaryButton text={"Leave"} disabled={false} onClick={() => setPopupObj({
                            state: true,
                            text: `You will no longer be able to access this room. But its possible to join the room in the future.`,
                            confirmation_text: "i understand",
                            button_text: "Leave the Room",
                            callback: async () => {
                                return new Promise(res => {
                                    socket.emit("leave_room", { 
                                        session_token: session_token,
                                        room_id: roomId
                                    }, async function (data) {
                                        if (data.status !== "success") {
                                            removeCookie("session_token")
                                            navigate("/login?i=0")
                                        } else {
                                            setDetailsWidget(false)
                                            setSelectedRoomId(null)
                                            await getRoomData()
                                            res()
                                        }
                                    })
                                })
                            }
                        })} />
                    </div>
                </div>
                }
            </div>
            </>}
        </div>
    )
}

export default RoomDetailsContainer