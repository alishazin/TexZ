import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import NavBar from "../components/NavBar"
import TextLogoImg from "../images/text-logo.png"
import LogoImg from "../images/logo.png"
import "../styles/navbarpage.css"
import "../styles/settings.css"
import { Icon } from '@iconify/react'
import TertiaryButton from "../components/TertiaryButton"

function Settings() {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [userObj, setUserObj] = useState(null)
    const [navbarState, setNavbarState] = useState(false)
    
    const navigate = useNavigate()
    const session_token = cookies.session_token

    useEffect(() => {
        document.title = "Settings"
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
                    <NavBar instance={4} />
                </div>
                <div className="navbar-page-content-container settings">
                    {userObj?.provider === "local" &&
                        <div className="option-container">
                            <TertiaryButton type={"url"} url={"/change-password"} text={"Change Your Password"} disabled={false} onClick={() => {}} />
                        </div>
                    }
                    <div className="option-container">
                        <TertiaryButton text={"Logout"} disabled={false} onClick={() => {
                            removeCookie("session_token")
                            navigate("/login?i=4")
                        }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings;