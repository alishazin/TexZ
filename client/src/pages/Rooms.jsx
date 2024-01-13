import { useState, useEffect } from "react"
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

var socket;

function Rooms({ instance }) {

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
    
    const screenSize = useScreenSize();
    const navigate = useNavigate()
    const session_token = cookies.session_token
    
    useEffect(() => {
        document.title = "Rooms"
        socket = io.connect("http://localhost:3000", {query: `session_token=${session_token}`})
    }, [])

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
            console.log("REFRESH");
			await getRoomData()
		})
    
	}, [socket])

    const handleSendMsg = async (e) => {
        e.preventDefault()

        socket.emit("send_message", { 
            session_token: session_token,
            roomId: roomData[selectedRoomCount-1]._id,
            text: sendMsgField
        }, async function (data) {
            if (data.status !== "success") {
                removeCookie("session_token")
                navigate("/login?i=0")
            } else {
                console.log("SEND", data)
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
                                {roomData[selectedRoomCount-1].messages.map((messageObj, _index) => (
                                    <MessageContainer key={_index} side={messageObj.from._id === userObj._id ? "right" : "left"} msg={messageObj.text} name={messageObj.from._id === userObj._id ? "You" : messageObj.from.username} date="2/01/2023" time="22:59" />
                                ))}
                                {/* <DateContainer day="THU" date="02" month="Jan" />
                                <MessageContainer side="right" msg="asdasdasd sad asdasdasdasdasdasdasd asdasdasd asdasdasd asdsa" name="You" date="2/01/2023" time="22:59" />
                                <DateContainer day="MON" date="26" month="Dec" />
                                <MessageContainer side="left" msg="asdasdasd sad asdasdasdasdasdasdasd asdasdasd asdasdasd asdsa asdas dasd asdasd asdasdas dasdasdasdas dasdasdasdsd" name="Ali Shazin" date="Yesterday" time="02:01" />
                                <InfoContainer content={"John Doe left the room"} />
                                <MessageContainer side="right" msg="Hi" name="Ali Shazin" date="Yesterday" time="02:05" /> */}
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
                            roomName={roomData[selectedRoomCount-1].name} 
                            roomDescription={roomData[selectedRoomCount-1].description}
                            roomCode={roomData[selectedRoomCount-1].room_id} 
                            participants={roomData[selectedRoomCount-1].participants} 
                            adminUser={roomData[selectedRoomCount-1].admin} 
                            setPopupObj={setPopupObj}
                            getRoomData={getRoomData}
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
                                        setSelectedRoomCount(_index + 1);
                                        setDetailsWidget(false)}
                                    } 
                                    roomName={obj.name} 
                                    roomDescription={obj.description} 
                                    timeLastMsg={"1 hour"} 
                                    unreadMsgCount={5} 
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