import "../styles/components/unreadmsgcontainer.css"
import useIsInViewport from "../hooks/useIsInViewport.jsx"
import { useEffect, useRef } from "react"

function UnreadMsgContainer({ isLast, messagesEndRef, setScrollNewVisible }) {

    const unreadMsgRef = useRef()
    const unreadMsgVisible = useIsInViewport(unreadMsgRef);

    useEffect(() => {
        setScrollNewVisible(unreadMsgVisible)
    }, [unreadMsgVisible])

    return (
        <div className="unread-msg-container" ref={(el) => {
            if (isLast) 
                messagesEndRef.current = el; 
            unreadMsgRef.current = el
        }}>
            <div className="left-line"></div>
            <div className="content-box" ref={unreadMsgRef}>New Messages</div>
            <div className="right-line"></div>
        </div>
    )
}

export default UnreadMsgContainer;