import "../styles/components/emailver.css"

function EmailVer({ text }) {

    return (
        <div className="emailver-container">
            <div className="email-icon"></div>
            <p>{text}</p>
        </div>
    )
}

export default EmailVer;