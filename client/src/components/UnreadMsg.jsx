import "../styles/components/unreadmsgcontainer.css"

function UnreadMsgContainer({ isLast, messagesEndRef }) {

    return (
        <div className="unread-msg-container" ref={isLast ? messagesEndRef : null}>
            <div className="left-line"></div>
            <div className="content-box">New Messages</div>
            <div className="right-line"></div>
        </div>
    )
}

export default UnreadMsgContainer;