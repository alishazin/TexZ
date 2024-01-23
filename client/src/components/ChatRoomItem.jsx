import "../styles/components/chatroomitem.css"
import { Icon } from '@iconify/react'
import { useState } from "react"

function ChatRoomItem({ className, style, roomName, roomDescription, timeLastMsg, unreadMsgCount, onClick, current = false, past }) {

    return (
        <div onClick={onClick} className={`chatroomitem-container ${current ? "current" : ""} ${past ? "past" : ""} ${className ? className : ""}`} style={style}>
            <div className="current-div"></div>
            <div className="left">
                <div className="room-name">{roomName}</div>
                <div className="room-description">{roomDescription}</div>
            </div>
            <div className="right">
                <div className="time-last-msg">{timeLastMsg}</div>
                {unreadMsgCount !== 0 && <div className="unread-msg-count">{unreadMsgCount}</div>}
            </div>
        </div>
    )
}

export default ChatRoomItem;