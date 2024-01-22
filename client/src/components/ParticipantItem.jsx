import "../styles/components/participantitem.css"
import QuaternaryButton from "./QuaternaryButton"
import { Icon } from '@iconify/react'
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"

function ParticipantItem({ name, id, isAdmin, adminIcon, setPopupObj, getRoomData, room_id, socket }) {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])

    const navigate = useNavigate()
    const session_token = cookies.session_token

    const handleSubmit = (e) => {
        e.preventDefault()

        setPopupObj({
            state: true,
            text: `Are you sure about removing ${name} ?`,
            confirmation_text: "yes, i am",
            button_text: "Remove",
            callback: async () => {
                return new Promise(res => {
                    socket.emit("remove_participant", { 
                        session_token: session_token,
                        room_id: room_id,
                        participant_id: id
                    }, async function (data) {
                        if (data.status !== "success") {
                            removeCookie("session_token")
                            navigate("/login?i=0")
                        } else {
                            // setDetailsWidget(false)
                            // setSelectedRoomCount(null)
                            await getRoomData()
                            res()
                        }
                    })
                })
            }
        })
    }

    return (
        <form className={`participant-item ${(!isAdmin) || !(isAdmin && !adminIcon) ? "single" : ""}`} onSubmit={handleSubmit}>
            <span className="name">{adminIcon && <Icon className="admin-icon" icon="eos-icons:admin-outlined" />}{name}</span>
            {(isAdmin && !adminIcon) && <QuaternaryButton text="Remove" disabled={false} />}
        </form>
    )
}

export default ParticipantItem;