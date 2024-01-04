import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import NavBar from "../components/NavBar"
import TextLogoImg from "../images/text-logo.png"
import LogoImg from "../images/logo.png"
import "../styles/navbarpage.css"
import "../styles/rooms.css"
import { Icon } from '@iconify/react'
import useScreenSize from "../hooks/useScreenSize"
import ChatRoomItem from "../components/ChatRoomItem"

function Rooms() {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [userObj, setUserObj] = useState(null)
    const [navbarState, setNavbarState] = useState(false)
    const [rightSwiperState, setRightSwiperState] = useState(false)
    const [roomCode, setRoomCode] = useState("")
    const [errorMsg, setErrorMsg] = useState("")  
    const [buttonDisabled, setButtonDisabled] = useState(true)  
    
    const screenSize = useScreenSize();
    const navigate = useNavigate()
    const session_token = cookies.session_token

    useEffect(() => {
        document.title = "Rooms"
        validateSession()
    }, [])

    const validateSession = async function() {
        if (!session_token) {
            navigate("/login?i=0")
            return;
        }
        
        try {
            const response = await axios.post("http://localhost:3000/api/auth/validate-session", {
                session_token: session_token
            })
            setUserObj(response.data)
        } catch(err) {
            if (err.response.status === 400) {
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
                    <div className="top-area">
                        <div className="room-name">Culers</div>
                        <div className="room-description">Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.</div>
                    </div>
                    <div className="chat-container">
                        <div className="msg-container">
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                            <div>asdasdsa</div>
                        </div>
                        <div className="send-msg-here-container">
                            <form className="send-msg-here-box">
                                <input name="message" placeholder="Type your message here" />
                                <button className="send-icon-container">
                                    <Icon icon="tabler:send" className="icon" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className={`right-container ${rightSwiperState ? "open" : "close"}`}>
                    <div className="swiper-container" onClick={handleSwiperClick}>
                        {rightSwiperState && <Icon className="icon" icon="line-md:arrow-right-circle" />}
                        {!rightSwiperState && <Icon className="icon" icon="line-md:arrow-left-circle" />}
                    </div>
                    <div className="content-container">
                        <ChatRoomItem roomName={"CSE-A Students Group"} roomDescription={"Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups."} timeLastMsg={"1 hour"} unreadMsgCount={5} />
                        <ChatRoomItem current={true} roomName={"Culers"} roomDescription={"Barcelona Fans."} timeLastMsg={"1 day"} unreadMsgCount={0} />
                        <ChatRoomItem roomName={"Totspur"} roomDescription={"Tottenham Fans."} timeLastMsg={"1 week"} unreadMsgCount={0} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Rooms;