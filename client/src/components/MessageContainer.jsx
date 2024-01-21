import "../styles/components/messagecontainer.css"
import { Icon } from '@iconify/react'
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"

function MessageContainer({ type, room_id, isAdmin, side, msg_id, msg, name, date, time, read_by_data, setPopupObj, setDeletePopupObj, socket, getRoomData, isLast, messagesEndRef }) {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    
    const navigate = useNavigate()
    const session_token = cookies.session_token

    const handleInfoClick = () => {
        setPopupObj({
            state: true,
            data: read_by_data,
            msg_id: msg_id
        })
    }

    const handleDeleteClick = () => {
        setDeletePopupObj({
            state: true,
            text: `Are you sure about deleting the message ?`,
            confirmation_text: "yes",
            button_text: "Delete",
            callback: () => {
                return new Promise(res => {
                    socket.emit("delete_message", { 
                        session_token: session_token,
                        room_id: room_id,
                        msg_id: msg_id
                    }, async function (data) {
                        if (data.status !== "success") {
                            removeCookie("session_token")
                            navigate("/login?i=0")
                        } else {
                            await getRoomData()
                            res()
                        }
                    })
                })
            }
        })
    }

    return (
        <div ref={isLast ? messagesEndRef : null}  className={`single-message-container ${side} ${type === "deleted_msg" ? "deleted" : ""}`}>
            {type === "msg" && side === "right" && <div className="transparent-area">
                <div className="box"><Icon onClick={handleDeleteClick} icon="material-symbols:delete-outline" className="icon" /></div>
                <div className="box"><Icon onClick={handleInfoClick} icon="material-symbols:info-outline" className="icon" /></div>
            </div>}
            <div className="opaque-area">
                <div className="msg-area">{type === "deleted_msg" && <Icon style={{marginRight: "7px", transform: "translateY(1px)"}} icon="icomoon-free:blocked" />}{msg}</div>
                <div className="details-area">
                    <div className="name">{name}</div>
                    <div className="date">{date}</div>
                    <div className="time">{time}</div>
                </div>
            </div>
            {type === "msg" && side === "left" && <div className="transparent-area">
                {isAdmin && <div className="box"><Icon onClick={handleDeleteClick} icon="material-symbols:delete-outline" className="icon" /></div>}
                <div className="box"><Icon onClick={handleInfoClick} icon="material-symbols:info-outline" className="icon" /></div>
            </div>}
        </div>
    )
}

export default MessageContainer;