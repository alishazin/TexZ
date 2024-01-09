import "../styles/components/participantitem.css"
import QuaternaryButton from "./QuaternaryButton"

function ParticipantItem({ name, isAdmin }) {

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    return (
        <form className={`participant-item ${!isAdmin ? "single" : ""}`} onSubmit={handleSubmit}>
            <span className="name">{name}</span>
            {isAdmin && <QuaternaryButton text="Remove" disabled={false} />}
        </form>
    )
}

export default ParticipantItem;