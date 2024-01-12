import "../styles/components/participantitem.css"
import QuaternaryButton from "./QuaternaryButton"
import { Icon } from '@iconify/react'

function ParticipantItem({ name, isAdmin, adminIcon, setPopupObj, getRoomData }) {

    const handleSubmit = (e) => {
        e.preventDefault()

        setPopupObj({
            state: true,
            text: `Are you sure about removing ${name} ?`,
            confirmation_text: "yes, i am",
            button_text: "Remove",
            callback: async () => {
                await getRoomData()
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