import { useState, useEffect, useRef } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import NavBar from "../components/NavBar"
import TextLogoImg from "../images/text-logo.png"
import LogoImg from "../images/logo.png"
import LogoImg2 from "../images/logo2.png"
import "../styles/navbarpage.css"
import "../styles/rooms.css"
import { Icon } from '@iconify/react'
import useScreenSize from "../hooks/useScreenSize"
import ChatRoomItem from "../components/ChatRoomItem"
import MessageContainer from "../components/MessageContainer"
import InfoContainer from "../components/InfoContainer"
import DateContainer from "../components/DateContainer"
import RoomDetailsContainer from "../components/RoomDetailsContainer"
import LoadingChatRoomItem from "../components/LoadingChatRoomItem"
import Popup from "../components/Popup"
import io from "socket.io-client"
import UnreadMsgContainer from "../components/UnreadMsg.jsx"
import { formatDate, formatTime, addDateStamps } from "../utils/date.js"
import { getUnreadMsgCount } from "../utils/utils.js"
import ReadByPopup from "../components/ReadByPopup.jsx"

var socket;

function Rooms() {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [roomData, setRoomData] = useState(null)
    const [selectedRoomCount, setSelectedRoomCount] = useState(null)
    const [userObj, setUserObj] = useState(null)
    const [navbarState, setNavbarState] = useState(false)
    const [rightSwiperState, setRightSwiperState] = useState(false)
    const [detailsWidget, setDetailsWidget] = useState(false)  
    const [sendMsgField, setSendMsgField] = useState("")  
    const [popupObj, setPopupObj] = useState({
        state: false,
        text: "",
        confirmation_text: "",
        button_text: "",
        callback: async () => {}
    }) 
    const [readByPopupObj, setReadByPopupObj] = useState({
        state: false,
        data: null,
        msg_id: null,
    })

    const lastRefresh = useRef(new Date().getTime())
    const prevSelectedRoomCount = useRef(null)
    const unreadMsgRecord = useRef({})
    
    const navigate = useNavigate()
    const session_token = cookies.session_token

    
    useEffect(() => {
        console.log("INITIALIZE");
        document.title = "Rooms"
        socket = io.connect("http://localhost:3000", {query: `session_token=${session_token}`})
        
        setInterval(async () => {
            if (new Date().getTime() - lastRefresh.current > 60000) {
                await getRoomData();
            }
        }, 5000)

    }, [])

    useEffect(() => {
        setSelectedRoomCount(value => {
            if (value && roomData) {
                markAsRead(roomData[value - 1])
            } else {
                getRoomData()
            }
            return value
        })
    }, [document.visibilityState])
    
    useEffect(() => {
        console.log("ROOM DATA CHANGES");
        lastRefresh.current = new Date().getTime()

        if (readByPopupObj.state === true) {
            for (let msgObj of roomData[selectedRoomCount - 1].messages) {
                if (msgObj._id === readByPopupObj.msg_id) {
                    setReadByPopupObj(prev => ({
                        ...prev,
                        data: msgObj.read_by_data,
                    }))
                    break
                }
            }
            // if not found, it may be deleted, so turn off popup, in future
        }
    }, [roomData])

    useEffect(() => {
        
        socket.on("fetch_data", response => {
            console.log(response);
			if (response.status === "invalid_session_token") {
                console.log("LOGGED OUT 1");
                removeCookie("session_token")
                navigate("/login?i=0")
            } else if (response.status === "success") {
                setUserObj(response.userData)
                setRoomData(response.roomData)
            }
		})
        
        socket.on("refresh_data", async (response) => {
            console.log("REFRESH");
            if (document.visibilityState == "hidden") return
            await getRoomData()
            
            setSelectedRoomCount(value => {
                if (value && roomData) {
                    // console.log("RECIEVED")
                    markAsRead(roomData[value - 1])
                } 
                return value
            })
		})
        
        socket.on("refresh_data_after_read", async (response) => {
            console.log("REFRESH AFTER READ");
            await getRoomData()
		})
    
	}, [socket])

    const markAsRead = (obj) => {
        if (document.visibilityState == "hidden") return
        socket.emit("mark_as_read", { 
            session_token: session_token,
            room_id: obj._id,
        }, async function (data) {
            if (data.status !== "success") {
                removeCookie("session_token")
                navigate("/login?i=0")
            } else {
                // console.log("MARK AS READ", data)
                await getRoomData()
            }
        })
    }

    const handleSendMsg = async (e) => {
        e.preventDefault()
        unreadMsgRecord.current[selectedRoomCount] = null

        socket.emit("send_message", { 
            session_token: session_token,
            room_id: roomData[selectedRoomCount-1]._id,
            text: sendMsgField
        }, async function (data) {
            if (data.status !== "success") {
                removeCookie("session_token")
                navigate("/login?i=0")
            } else {
                // console.log("SEND", data)
                await getRoomData()
            }
        })
        
        setSendMsgField("")

    }

    const getRoomData = async function() {
        if (!session_token) {
            navigate("/login?i=0")
            return;
        }
        
        try {
            console.log(session_token);
            const response = await axios.get("http://localhost:3000/api/chat/get-all", {
                headers: {
                    "session-token": session_token
                }
            })
            setUserObj(response.data.userData)
            setRoomData(response.data.roomData)
        } catch(err) {
            if (err.response.status === 401) {
                removeCookie("session_token")
                navigate("/login?i=0")
            }
            console.log(err);
        }
    }

    const handleMenuIconClick = () => {
        setRightSwiperState(false)
        setNavbarState(prevValue => !prevValue)
    }

    const handleSwiperClick = () => {
        setNavbarState(false)
        setRightSwiperState(prevValue => !prevValue)
    }

    return (
        <div className="navbar-page-container">
            {popupObj.state && <Popup popupObj={popupObj} setPopupObj={setPopupObj} />}
            {readByPopupObj.state && <ReadByPopup userObj={userObj} popupObj={readByPopupObj} setPopupObj={setReadByPopupObj} />}
            <div className="top-bar">
                {navbarState && <Icon onClick={handleMenuIconClick} className="menu-icon" icon="line-md:menu-to-close-transition"/>}
                {!navbarState && <Icon onClick={handleMenuIconClick} className="menu-icon" icon="line-md:close-to-menu-transition"/>}
                <div className="separator"></div>
                <div className="top-content">
                    <img className="text-logo" src={TextLogoImg} />
                    <img className="logo" src={LogoImg} />
                </div>
            </div>
            <div className="content">
                <div className={`navbar-container ${navbarState ? "open" : "close"}`}>
                    <NavBar instance={1} />
                </div>
                <div className="navbar-page-content-container three">
                    {(!detailsWidget && selectedRoomCount) && <>
                        <div className="top-area">
                            <div className="room-name" onClick={() => setDetailsWidget(true)}>{roomData[selectedRoomCount-1].name}</div>
                            <div className="room-description">{roomData[selectedRoomCount-1].description}</div>
                        </div>
                        <div className="chat-container">
                            <div className="msg-container">
                                {addDateStamps(roomData[selectedRoomCount-1].messages, userObj._id, unreadMsgRecord, selectedRoomCount).map((messageOrDateObj, _index) => {
                                    if (messageOrDateObj.type === "message") {
                                        return (
                                        <MessageContainer 
                                            key={_index} 
                                            msg_id={messageOrDateObj._id}
                                            side={messageOrDateObj.from._id === userObj._id ? "right" : "left"} 
                                            msg={messageOrDateObj.text} 
                                            name={messageOrDateObj.from._id === userObj._id ? "You" : messageOrDateObj.from.username} 
                                            date={formatDate(messageOrDateObj.dateObj)}
                                            time={formatTime(messageOrDateObj.dateObj)} 
                                            read_by_data={messageOrDateObj.read_by_data} 
                                            setPopupObj={setReadByPopupObj}
                                        />)
                                    } else if (messageOrDateObj.type === "date") {
                                        return (
                                        <DateContainer 
                                            key={_index} 
                                            day={messageOrDateObj.dayName} 
                                            date={messageOrDateObj.dateNum} 
                                            month={messageOrDateObj.monthName}  
                                        />)
                                    } else if (messageOrDateObj.type === "unread") {
                                        return (
                                            <UnreadMsgContainer key={_index} />
                                        )
                                    }
                                })}
                            </div>
                            <div className="send-msg-here-container">
                                <form className="send-msg-here-box" onSubmit={handleSendMsg}>
                                    <input autoComplete="off" onChange={e => setSendMsgField(e.target.value)} name="message" placeholder="Type your message here" value={sendMsgField} />
                                    <button className="send-icon-container">
                                        <Icon icon="tabler:send" className="icon" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>}
                    {(!detailsWidget && !selectedRoomCount) && <>
                        <div className="empty-selected-container">
                            <img className="logo" src={LogoImg2} />
                            <div className="text"><span>"</span>Create a room and start texzing<span>"</span></div>
                            {!roomData && <Icon icon="eos-icons:bubble-loading" className="loading-icon" />}
                        </div>
                    </>}
                    {detailsWidget && 
                        <RoomDetailsContainer 
                            isAdmin={roomData[selectedRoomCount-1].admin._id === userObj._id} 
                            setDetailsWidget={setDetailsWidget} 
                            roomId={roomData[selectedRoomCount-1]._id}
                            roomName={roomData[selectedRoomCount-1].name} 
                            roomDescription={roomData[selectedRoomCount-1].description}
                            roomCode={roomData[selectedRoomCount-1].room_id} 
                            participants={roomData[selectedRoomCount-1].participants} 
                            adminUser={roomData[selectedRoomCount-1].admin} 
                            setPopupObj={setPopupObj}
                            getRoomData={getRoomData}
                            socket={socket}
                            roomData={roomData}
                        />
                    }
                </div>
                <div className={`right-container ${rightSwiperState ? "open" : "close"}`}>
                    <div className="swiper-container" onClick={handleSwiperClick}>
                        {rightSwiperState && <Icon className="icon" icon="line-md:arrow-right-circle" />}
                        {!rightSwiperState && <Icon className="icon" icon="line-md:arrow-left-circle" />}
                    </div>
                    {roomData ? <>
                        <div className="content-container">
                            {roomData.map((obj, _index) => (
                                <ChatRoomItem 
                                    key={_index} 
                                    current={selectedRoomCount === _index + 1} 
                                    onClick={() => {
                                        unreadMsgRecord.current[prevSelectedRoomCount.current] = null
                                        setSelectedRoomCount(prev => {
                                            prevSelectedRoomCount.current = prev
                                            return _index + 1
                                        })
                                        markAsRead(obj)
                                        setDetailsWidget(false)
                                    }}
                                    roomName={obj.name} 
                                    roomDescription={obj.description} 
                                    timeLastMsg={obj.messages.length ? obj.messages[obj.messages.length - 1].stamp : ""} 
                                    unreadMsgCount={getUnreadMsgCount(obj, userObj._id)} 
                                />
                            ))}
                        </div>
                    </> : <>
                        <div className="loading-content-container">
                            <LoadingChatRoomItem />
                            <LoadingChatRoomItem />
                            <LoadingChatRoomItem />
                            <LoadingChatRoomItem />
                        </div>
                    </>}
                </div>
            </div>
        </div>
    )
}

export default Rooms;