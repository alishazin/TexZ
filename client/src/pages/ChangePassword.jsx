import "../styles/login.css"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCookies } from "react-cookie"
import Textfield from "../components/Textfield"
import PrimaryButton from "../components/PrimaryButton"
import Background from "../components/Background"
import TextLogo from "../components/TextLogo"
import axios from "axios"

function ChangePassword() {

    const { resetpass_token } = useParams()
    const navigate = useNavigate()
    
    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const userObj = useRef(null)

    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [passwordOld, setPasswordOld] = useState("")
    const [passwordNew, setPasswordNew] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const session_token = cookies.session_token

    useEffect(() => {
        if (passwordOld.length >= 8 && passwordNew.length >= 8) setButtonDisabled(false)
        else setButtonDisabled(true)
    }, [passwordOld, passwordNew])

    useEffect(() => {
        validateSession()
    }, [])

    const validateSession = async function() {
        if (!session_token) {
            navigate("/login")
            return;
        }
        
        try {
            const response = await axios.post("http://localhost:3000/api/auth/validate-session", {
                session_token: session_token
            })
            userObj.current = response.data
            console.log(userObj);
        } catch(err) {
            if (err.response.status === 400) {
                removeCookie("session_token")
                navigate("/login")
            }
            console.log(err);
        }
    }

    const handleChange = function (event) {
        if (event.target.name === "old-password") setPasswordOld(event.target.value)
        else if (event.target.name === "new-password") setPasswordNew(event.target.value)
    }

    const sendPostReq = async function (e) {
        // e.preventDefault()
        // if (buttonDisabled) return
        
        // try {
        //     const response = await axios.post("http://localhost:3000/api/auth/login", {
        //         email: email.trim(),
        //         password
        //     })
        //     setCookie("session_token", response.data.session_token)

        // } catch(err) {
        //     if (err.response.status === 400) {
        //         setErrorMsg(err.response.data.err_msg)
        //     }
        //     console.log(err);
        // }
    }

    return (
        <>
            <Background />
            <div className="login-page">
                <form className="container" onSubmit={sendPostReq} style={{height: "450px"}}>
                    <TextLogo />
                    <Textfield onChange={handleChange} name="old-password" value={passwordOld} type="password" label="Old Password" placeholder="Enter old password" icon_cls="fa-solid fa-lock" />
                    <Textfield className="last" onChange={handleChange} name="new-password" value={passwordNew} type="password" label="New Password" placeholder="Repeat new password" icon_cls="fa-solid fa-lock" />
                    <div className="error-text" style={{margin: "10px 0 30px"}}>{errorMsg}</div>
                    <PrimaryButton text="CHANGE PASSWORD" disabled={buttonDisabled} />
                </form>
            </div>
        </>
    )
}

export default ChangePassword;