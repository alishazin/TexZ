import "../styles/components/secondarybutton.css"

function SecondaryButton({ type, text, url }) {

    return (
        <>
            {type === "url" && <a href={url} className="sec-but">{text}</a>}
            {type === "btn" && <div className="sec-but">{text}</div>}
        </>
    )
}

export default SecondaryButton;