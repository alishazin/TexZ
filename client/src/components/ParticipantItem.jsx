import "../styles/components/participantitem.css"
import QuaternaryButton from "./QuaternaryButton"

function ParticipantItem({ name }) {

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    return (
        <form className="participant-item" onSubmit={handleSubmit}>
            <span className="name">{name}</span>
            <QuaternaryButton text="Remove" disabled={false} />
        </form>
    )
}

export default ParticipantItem;