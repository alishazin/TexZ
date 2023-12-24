import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import NavBar from "../components/NavBar"
import "../styles/navbarpage.css"

function CreateRoom() {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [userObj, setUserObj] = useState(null)
    console.log(userObj);

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

    return (
        <div className="navbar-page-container">
            <div className="top-bar">

            </div>
            <div className="content">
                <div className="navbar-container">
                    <NavBar />
                </div>
                <div className="navbar-page-content-container">
                    {userObj && <>
                        <p>Dashboard</p>
                    </>}
                </div>
            </div>
        </div>
    )
}

export default CreateRoom;