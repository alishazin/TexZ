import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import NavBar from "../components/NavBar"
import TextLogoImg from "../images/text-logo.png"
import LogoImg from "../images/logo.png"
import "../styles/navbarpage.css"
import "../styles/createroom.css"
import { Icon } from '@iconify/react'
import SecondaryButton from "../components/SecondaryButton"
import Textfield2 from "../components/Textfield2"

function JoinRoom() {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [userObj, setUserObj] = useState(null)
    const [navbarState, setNavbarState] = useState(false)
    const [roomCode, setRoomCode] = useState("")
    const [errorMsg, setErrorMsg] = useState("")  
    const [buttonDisabled, setButtonDisabled] = useState(true)  
    
    const navigate = useNavigate()
    const session_token = cookies.session_token

    useEffect(() => {
        document.title = "Join Room"
        validateSession()
    }, [])

    useEffect(() => {
        if (roomCode.trim().length >= 1) setButtonDisabled(false)
        else setButtonDisabled(true)
    }, [roomCode])

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
            if (err.response.status === 401) {
                removeCookie("session_token")
                navigate("/login?i=0")
            }
            console.log(err);
        }
    }

    const handleMenuIconClick = () => {
        setNavbarState(prevValue => !prevValue)
    }

    const handleChange = (event) => {
        if (event.target.name === "room_code") setRoomCode(event.target.value)
    }

    const sendPostReq = async (e) => {
        e.preventDefault()

        if (buttonDisabled) return
        
        try {
            setButtonDisabled(true)
            const response = await axios.post("http://localhost:3000/api/room/join", {
                session_token: session_token,
                room_code: roomCode
            },
            {
                headers: {
                    "session-token": session_token
                }
            })
            console.log(response.data);
            setButtonDisabled(false)
            setRoomCode("")
            setErrorMsg("")
            
        } catch(err) {
            if (err.response.status === 400) {
                setErrorMsg(err.response.data.err_msg)
            }
            else if (err.response.status === 401) {
                removeCookie("session_token")
                navigate("/login?i=0")
            }
            console.log(err);
        }
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
                    <NavBar instance={3} />
                </div>
                <div className="navbar-page-content-container">
                    <form onSubmit={sendPostReq}>
                        <Textfield2 value={roomCode} onChange={handleChange} style={{marginBottom: "30px"}} type="text" label="Room Code" name="room_code" placeholder="Enter the code shared by your friend" />
                        <div style={{marginBottom: "10px"}} className="error-text">{errorMsg}</div>
                        <SecondaryButton type="btn2" text="JOIN ROOM" disabled={buttonDisabled} />
                    </form>
                </div>
            </div>
        </div>
    )
}

export default JoinRoom;