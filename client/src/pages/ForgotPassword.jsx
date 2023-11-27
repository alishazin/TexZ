import "../styles/login.css"
import { useState, useEffect, useRef } from "react"
import Textfield from "../components/Textfield"
import PrimaryButton from "../components/PrimaryButton"
import Background from "../components/Background"
import TextLogo from "../components/TextLogo"
import axios from "axios"

function ForgotPassword() {

    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [email, setEmail] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        if (email.trim().length > 0) setButtonDisabled(false)
        else setButtonDisabled(true)
    }, [email])

    const handleChange = function (event) {
        if (event.target.name === "email") setEmail(event.target.value)
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
                <form className="container" onSubmit={sendPostReq} style={{height: "350px"}}>
                    <TextLogo />
                    <Textfield className="last" onChange={handleChange} name="email" value={email} type="text" label="Email" placeholder="Enter registered email" icon_cls="fa-solid fa-envelope" />
                    <div className="help-text">You will recieve a link through your email to reset your password.</div>
                    <div className="error-text" style={{margin: "10px 0 20px"}}>{errorMsg}</div>
                    <PrimaryButton text="REQUEST LINK" disabled={buttonDisabled} />
                </form>
            </div>
        </>
    )
}

export default ForgotPassword;