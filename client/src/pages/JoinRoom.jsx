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
import useScreenSize from "../hooks/useScreenSize"
import SecondaryButton from "../components/SecondaryButton"
import Textfield2 from "../components/Textfield2"
import Checkbox from "../components/Checkbox"

function JoinRoom() {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [userObj, setUserObj] = useState(null)
    const [navbarState, setNavbarState] = useState(false)
    const [roomCode, setRoomCode] = useState("")
    const [errorMsg, setErrorMsg] = useState("")    
    
    const screenSize = useScreenSize();
    const navigate = useNavigate()
    const session_token = cookies.session_token

    useEffect(() => {
        document.title = "Create Room"
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
        setNavbarState(prevValue => !prevValue)
    }

    const handleChange = (event) => {
        if (event.target.name === "room_code") setRoomCode(event.target.value)
    }

    const sendPostReq = (e) => {
        e.preventDefault()
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
                        <SecondaryButton type="btn2" text="JOIN ROOM" />
                    </form>
                </div>
            </div>
        </div>
    )
}

export default JoinRoom;