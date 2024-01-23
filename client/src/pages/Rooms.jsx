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
import { formatDate, formatTime, addDateStamps, sortChatByTime } from "../utils/date.js"
import { getUnreadMsgCount, getRoomIndexById } from "../utils/utils.js"
import ReadByPopup from "../components/ReadByPopup.jsx"

var socket;

function Rooms() {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [visibilityState, setVisibilityState] = useState(true)
    const [roomData, setRoomData] = useState(null)
    const [selectedRoomId, setSelectedRoomId] = useState(null)
    const [userObj, setUserObj] = useState(null)
    const [navbarState, setNavbarState] = useState(false)
    const [rightSwiperState, setRightSwiperState] = useState(false)
    const [detailsWidget, setDetailsWidget] = useState(false)  
    const [sendMsgField, setSendMsgField] = useState("")  
    const [sendMsgLoading, setSendMsgLoading] = useState(false)  
    const [scrollDownVisible, setScrollDownVisible] = useState(false);
    const [scrollNewVisible, setScrollNewVisible] = useState(false);

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
    const messagesEndRef = useRef()

    const navigate = useNavigate()
    const session_token = cookies.session_token

    const toggleVisible = (e) => {
        setScrollDownVisible(
            e.target.scrollHeight - (e.target.scrollTop + e.target.clientHeight) > 100
        );
    };
    
    useEffect(() => {
        document.title = "Rooms"
        socket = io.connect("http://localhost:3000", {query: `session_token=${session_token}`})
        
        setInterval(async () => {
            if (new Date().getTime() - lastRefresh.current > 60000) {
                await getRoomData();
            }
        }, 5000)

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                setVisibilityState(true)
            } else {
                setVisibilityState(false)
            }
        })

    }, [])

    useEffect(() => {
        if (visibilityState) {
            setSelectedRoomId(value => {
                if (value && roomData) {
                    markAsRead(roomData[getRoomIndexById(roomData,value)])
                } else {
                    getRoomData()
                }
                return value
            })
        }
    }, [visibilityState])

    useEffect(() => {
        if (!detailsWidget) {
            scrollToLastMsg("instant")
        }
    }, [detailsWidget])
    
    useEffect(() => {
        lastRefresh.current = new Date().getTime()

        if (readByPopupObj.state === true) {
            for (let msgObj of roomData[getRoomIndexById(roomData, selectedRoomId)].messages) {
                if (msgObj.type === "msg" && msgObj._id === readByPopupObj.msg_id) {
                    setReadByPopupObj(prev => ({
                        ...prev,
                        data: msgObj.read_by_data,
                    }))
                    return 
                }
            }

            // if ready_by opened msg is deleted
            setReadByPopupObj({
                state: false,
                data: null,
                msg_id: null,
            })
        }
    }, [roomData])

    useEffect(() => {
        
        socket.on("fetch_data", response => {
            console.log(response);
			if (response.status === "invalid_session_token") {
                removeCookie("session_token")
                navigate("/login?i=0")
            } else if (response.status === "success") {
                setUserObj(response.userData)
                setRoomData(response.roomData)
            }
		})
        
        socket.on("refresh_data", async (response) => {
            if (response.special === "recieve_msg") {
                await getRoomData()
                setSelectedRoomId(value => {
                    if (value && roomData) {
                        markAsRead(roomData[getRoomIndexById(roomData,value)])
                    } 
                    return value
                })
            }
            else {
                await getRoomData()
            }
            
		})
        
        socket.on("refresh_data_after_read", async (response) => {
            await getRoomData()
		})
        
        socket.on("refresh_data_after_removal", async (response) => {
            
            setUserObj(async (value) => {
                console.log("value", value);
                if (response.participant_id === value?._id) {
                    setDetailsWidget(false)
                    setSelectedRoomId(null)
                }
                await getRoomData()
                return value
            })
            

		})
    
	}, [socket])

    const scrollToLastMsg = (behavior) => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: behavior })
        }, 100)
    }

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
                await getRoomData()
            }
        })
    }

    const handleSendMsg = async (e) => {
        e.preventDefault()
        if (!sendMsgField.trim() || sendMsgLoading) return;
        unreadMsgRecord.current[selectedRoomId] = null

        setSendMsgLoading(true)
        socket.emit("send_message", { 
            session_token: session_token,
            room_id: selectedRoomId,
            text: sendMsgField
        }, async function (data) {
            if (data.status !== "success") {
                removeCookie("session_token")
                navigate("/login?i=0")
            } else {
                await getRoomData()
                setSendMsgField("")
                setSendMsgLoading(false)
                scrollToLastMsg("smooth")
            }
        })
        

    }

    const getRoomData = async function(scrollToEnd = false) {
        if (!session_token) {
            navigate("/login?i=0")
            return;
        }
        
        try {
            const response = await axios.get("http://localhost:3000/api/chat/get-all", {
                headers: {
                    "session-token": session_token
                }
            })
            setUserObj(response.data.userData)
            setRoomData(response.data.roomData)
            
            if (scrollToEnd)
                scrollToLastMsg("smooth")
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
                    {(!detailsWidget && selectedRoomId) && <>
                        <div className="top-area">
                            <div className="room-name" onClick={() => setDetailsWidget(true)}>{roomData[getRoomIndexById(roomData, selectedRoomId)].name}</div>
                            <div className="room-description">{roomData[getRoomIndexById(roomData, selectedRoomId)].description}</div>
                        </div>
                        <div className="chat-container">
                            <div className="msg-container" onScroll={toggleVisible}>
                                {addDateStamps(roomData[getRoomIndexById(roomData, selectedRoomId)].messages, userObj._id, unreadMsgRecord, selectedRoomId).map((messageOrDateObj, _index) => {
                                    if (messageOrDateObj.type === "msg") {
                                        return (
                                        <MessageContainer 
                                            key={_index} 
                                            type={messageOrDateObj.type}
                                            isAdmin={roomData[getRoomIndexById(roomData, selectedRoomId)].admin._id === userObj._id} 
                                            room_id={selectedRoomId}
                                            msg_id={messageOrDateObj._id}
                                            side={messageOrDateObj.from._id === userObj._id ? "right" : "left"} 
                                            msg={messageOrDateObj.text} 
                                            name={messageOrDateObj.from._id === userObj._id ? "You" : messageOrDateObj.from.username} 
                                            date={formatDate(messageOrDateObj.dateObj)}
                                            time={formatTime(messageOrDateObj.dateObj)} 
                                            read_by_data={messageOrDateObj.read_by_data} 
                                            setPopupObj={setReadByPopupObj}
                                            setDeletePopupObj={setPopupObj}
                                            socket={socket}
                                            getRoomData={getRoomData}
                                            isLast={messageOrDateObj.isLast}
                                            messagesEndRef={messagesEndRef}
                                        />)
                                    } else if (messageOrDateObj.type === "deleted_msg") {
                                        return (
                                        <MessageContainer 
                                            key={_index} 
                                            type={messageOrDateObj.type}
                                            room_id={selectedRoomId}
                                            msg_id={messageOrDateObj._id}
                                            side={messageOrDateObj.from._id === userObj._id ? "right" : "left"} 
                                            msg={"This message was deleted by admin"} 
                                            date={formatDate(messageOrDateObj.dateObj)}
                                            time={formatTime(messageOrDateObj.dateObj)}
                                            isLast={messageOrDateObj.isLast}
                                            messagesEndRef={messagesEndRef} 
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
                                        <UnreadMsgContainer 
                                            key={_index} 
                                            isLast={messageOrDateObj.isLast}
                                            messagesEndRef={messagesEndRef} 
                                            setScrollNewVisible={setScrollNewVisible}
                                        />)
                                    } else if (messageOrDateObj.type === "info_leave") {
                                        return (
                                        <InfoContainer
                                            key={_index} 
                                            content={`${messageOrDateObj.from.username} has left the room`}
                                            isLast={messageOrDateObj.isLast}
                                            messagesEndRef={messagesEndRef}
                                        />)
                                    } else if (messageOrDateObj.type === "info_join") {
                                        return (
                                        <InfoContainer 
                                            key={_index}
                                            content={`${messageOrDateObj.from.username} has joined the room`}
                                            isLast={messageOrDateObj.isLast}
                                            messagesEndRef={messagesEndRef}
                                        />)
                                    } else if (messageOrDateObj.type === "info_create") {
                                        return (
                                        <InfoContainer 
                                            key={_index}
                                            content={`${messageOrDateObj.from.username} has created the room`}
                                            isLast={messageOrDateObj.isLast}
                                            messagesEndRef={messagesEndRef}
                                        />)
                                    } else if (messageOrDateObj.type === "info_remove") {
                                        return (
                                        <InfoContainer 
                                            key={_index}
                                            content={`${messageOrDateObj.from.username} was removed by the admin`}
                                            isLast={messageOrDateObj.isLast}
                                            messagesEndRef={messagesEndRef}
                                        />)
                                    }
                                })}
                            </div>
                            <div className="send-msg-here-container">
                                <form className="send-msg-here-box" onSubmit={handleSendMsg}>
                                    <input autoComplete="off" onChange={e => {
                                            if (!sendMsgLoading)
                                            setSendMsgField(e.target.value)
                                    }} name="message" placeholder="Type your message here" value={sendMsgField} />
                                    <button className={`send-icon-container ${sendMsgLoading ? "loading" : ""}`}>
                                        <Icon icon="tabler:send" className="icon" />
                                    </button>
                                </form>
                            </div>
                            {!unreadMsgRecord.current[selectedRoomId] && scrollDownVisible && <div className="scroll-down-btn" onClick={() => scrollToLastMsg("smooth")}><Icon className="icon" icon="teenyicons:double-caret-down-outline" /></div>}
                            {!scrollNewVisible && unreadMsgRecord.current[selectedRoomId] && <div className="new-msg-btn" onClick={() => scrollToLastMsg("smooth")}>New <Icon className="icon" icon="ph:caret-up-down-bold" /></div>}
                        </div>
                    </>}
                    {(!detailsWidget && !selectedRoomId) && <>
                        <div className="empty-selected-container">
                            <img className="logo" src={LogoImg2} />
                            <div className="text"><span>"</span>Create a room and start texzing<span>"</span></div>
                            {!roomData && <Icon icon="eos-icons:bubble-loading" className="loading-icon" />}
                        </div>
                    </>}
                    {detailsWidget && 
                        <RoomDetailsContainer 
                            isAdmin={roomData[getRoomIndexById(roomData, selectedRoomId)].admin._id === userObj._id} 
                            setDetailsWidget={setDetailsWidget} 
                            roomId={selectedRoomId}
                            roomName={roomData[getRoomIndexById(roomData, selectedRoomId)].name} 
                            roomDescription={roomData[getRoomIndexById(roomData, selectedRoomId)].description}
                            roomCode={roomData[getRoomIndexById(roomData, selectedRoomId)].room_id} 
                            allowJoin={roomData[getRoomIndexById(roomData, selectedRoomId)].allow_join} 
                            participants={roomData[getRoomIndexById(roomData, selectedRoomId)].participants} 
                            adminUser={roomData[getRoomIndexById(roomData, selectedRoomId)].admin} 
                            setPopupObj={setPopupObj}
                            getRoomData={getRoomData}
                            socket={socket}
                            roomData={roomData}
                            setSelectedRoomId={setSelectedRoomId}
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
                            {sortChatByTime(roomData).map((obj, _index) => {
                                if (obj.past) {
                                    return (
                                    <ChatRoomItem 
                                        key={obj._index} 
                                        current={selectedRoomId === obj._id} 
                                        onClick={() => {}}
                                        roomName={obj.name} 
                                        roomDescription={obj.description} 
                                        timeLastMsg={obj.stamp} 
                                        unreadMsgCount={0} 
                                        past={true}
                                    />
                                    )
                                } else {
                                    return (
                                    <ChatRoomItem 
                                        key={obj._index} 
                                        current={selectedRoomId === obj._id} 
                                        onClick={() => {
                                            unreadMsgRecord.current[prevSelectedRoomCount.current] = null
                                            setSelectedRoomId(prev => {
                                                prevSelectedRoomCount.current = prev
                                                return obj._id
                                            })
                                            setSendMsgField("")
                                            markAsRead(obj)
                                            setDetailsWidget(false)
                                            scrollToLastMsg("instant")
                                        }}
                                        roomName={obj.name} 
                                        roomDescription={obj.description}
                                        timeLastMsg={obj.messages.length ? obj.messages[obj.messages.length - 1].stamp : ""} 
                                        unreadMsgCount={getUnreadMsgCount(obj, userObj._id)}
                                        past={false} 
                                    />
                                    )
                                }
                            })}
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