import "../styles/components/quaternarybutton.css"

function QuaternaryButton({ text, disabled }) {

    return (
        <button className={`quaternary-but ${disabled ? "disabled" : ""}`}>{text}</button>
    )
}

export default QuaternaryButton;