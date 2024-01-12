import "../styles/components/primarybutton.css"

function PrimaryButton({ text, disabled, loading = false }) {

    return (
        <button className={`pri-but ${disabled ? "disabled" : ""} ${loading ? "loading" : ""}`}>{text}</button>
    )
}

export default PrimaryButton;