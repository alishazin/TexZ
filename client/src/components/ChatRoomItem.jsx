import "../styles/components/chatroomitem.css"
import { Icon } from '@iconify/react'
import { useState } from "react"

function ChatRoomItem({ className, style, roomName, roomDescription, timeLastMsg, unreadMsgCount, current = false }) {

    return (
        <div className={`chatroomitem-container ${current ? "current" : ""} ${className ? className : ""}`} style={style}>
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