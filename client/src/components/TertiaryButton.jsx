import "../styles/components/tertiarybutton.css"

function TertiaryButton({ text, disabled }) {

    return (
        <button className={`ter-but ${disabled ? "disabled" : ""}`}>{text}</button>
    )
}

export default TertiaryButton;