import "../styles/components/secondarybutton.css"

function SecondaryButton({ type, text, url, disabled }) {

    return (
        <>
            {type === "url" && <a href={url} className={`sec-but ${disabled ? "disabled" : ""}`}>{text}</a>}
            {type === "btn" && <div className={`sec-but ${disabled ? "disabled" : ""}`}>{text}</div>}
            {type === "btn2" && <button className={`sec-but ${disabled ? "disabled" : ""}`}>{text}</button>}
        </>
    )
}

export default SecondaryButton;