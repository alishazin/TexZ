import "../styles/login.css"
import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import Textfield from "../components/Textfield"
import PrimaryButton from "../components/PrimaryButton"
import Background from "../components/Background"
import TextLogo from "../components/TextLogo"
import axios from "axios"

function ResetPassword() {

    const { resetpass_token } = useParams()
    
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [password, setPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        if (password === passwordRepeat && password.length >= 8) setButtonDisabled(false)
        else setButtonDisabled(true)
    }, [password, passwordRepeat])

    const handleChange = function (event) {
        if (event.target.name === "password") setPassword(event.target.value)
        else if (event.target.name === "repeat-password") setPasswordRepeat(event.target.value)
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
                    <Textfield onChange={handleChange} name="password" value={password} type="password" label="Password" placeholder="Enter new password" icon_cls="fa-solid fa-lock" />
                    <Textfield className="last" onChange={handleChange} name="repeat-password" value={passwordRepeat} type="password" label="Repeat Password" placeholder="Repeat new password" icon_cls="fa-solid fa-lock" />
                    <div className="error-text" style={{margin: "10px 0 30px"}}>{errorMsg}</div>
                    <PrimaryButton text="RESET PASSWORD" disabled={buttonDisabled} />
                </form>
            </div>
        </>
    )
}

export default ResetPassword;