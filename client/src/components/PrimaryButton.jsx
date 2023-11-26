import "../styles/components/primarybutton.css"

function PrimaryButton({ text, disabled }) {

    return (
        <button className={`pri-but ${disabled ? "disabled" : ""}`}>{text}</button>
    )
}

export default PrimaryButton;