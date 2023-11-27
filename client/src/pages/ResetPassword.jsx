import "../styles/login.css"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCookies } from "react-cookie"
import Textfield from "../components/Textfield"
import PrimaryButton from "../components/PrimaryButton"
import Background from "../components/Background"
import TextLogo from "../components/TextLogo"
import axios from "axios"

function ResetPassword() {

    const { resetpass_token } = useParams()
    const navigate = useNavigate()
    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    
    const [userEmail, setUserEmail] = useState(null)
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [password, setPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        if (password === passwordRepeat && password.length >= 8) setButtonDisabled(false)
        else setButtonDisabled(true)
    }, [password, passwordRepeat])

    useEffect(() => {
        verifyToken();
    }, [])

    const handleChange = function (event) {
        if (event.target.name === "password") setPassword(event.target.value)
        else if (event.target.name === "repeat-password") setPasswordRepeat(event.target.value)
    }

    const verifyToken = async function (e) {        
        try {
            const response = await axios.post("http://localhost:3000/api/auth/verify-resetpass-token", {
                resetpass_token: resetpass_token,
            })
            setUserEmail(response.data.email)
        } catch(err) {
            if (err.response.status === 401) {
                navigate("/create-room")
            }
            console.log(err);
        }
    }

    const sendPostReq = async function (e) {
        e.preventDefault()
        if (buttonDisabled) return
        
        try {
            const response = await axios.post("http://localhost:3000/api/auth/reset-password", {
                resetpass_token: resetpass_token,
                new_password: password
            })
            removeCookie("session_token")
            navigate("/login")
        } catch(err) {
            if (err.response.status === 400) {
                setErrorMsg(err.response.data.err_msg)
            }
            else if (err.response.status === 401) {
                navigate("/login")
            }
            console.log(err);
        }
    }

    return (
        <>
        {userEmail && <>
            <Background />
            <div className="login-page">
                <form className="container" onSubmit={sendPostReq} style={{height: "450px"}}>
                    <TextLogo />
                    <input type="text" name="email" autoComplete="email" defaultValue={userEmail} hidden/>
                    <Textfield onChange={handleChange} name="password" value={password} type="password" label="Password" placeholder="Enter new password" icon_cls="fa-solid fa-lock" />
                    <Textfield className="last" onChange={handleChange} name="repeat-password" value={passwordRepeat} type="password" label="Repeat Password" placeholder="Repeat new password" icon_cls="fa-solid fa-lock" />
                    <div className="error-text" style={{margin: "10px 0 30px"}}>{errorMsg}</div>
                    <PrimaryButton text="RESET PASSWORD" disabled={buttonDisabled} />
                </form>
            </div>
        </>
        }
        </>
    )
}

export default ResetPassword;