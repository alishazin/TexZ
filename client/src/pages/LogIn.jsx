import "../styles/login.css"
import Background from "../components/Background"
import Textfield from "../components/Textfield"
import PrimaryButton from "../components/PrimaryButton"
import ORSeparator from "../components/ORSeparator"
import GoogleButton from "../components/GoogleButton"
import BottomTextLink from "../components/BottomTextLink"
import Logo from "../components/Logo"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

function LogIn() {

    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])

    let navigate = useNavigate()

    useEffect(() => {
        if (password.length >= 8 && email.trim().length > 0) setButtonDisabled(false)
        else setButtonDisabled(true)
    }, [email, password])

    const handleChange = function (event) {
        if (event.target.name === "email") setEmail(event.target.value)
        else if (event.target.name === "password") setPassword(event.target.value)
    }

    const sendPostReq = async function (e) {
        e.preventDefault()
        if (buttonDisabled) return
        
        try {
            const response = await axios.post("http://localhost:3000/api/auth/login", {
                email: email.trim(),
                password
            })
            setCookie("session_token", response.data.session_token)
            navigate("/create-room")

        } catch(err) {
            if (err.response.status === 400) {
                setErrorMsg(err.response.data.err_msg)
            }
            console.log(err);
        }
    }

    return (
        <>
            <Background />
            <div className="login-page">
                <form className="container" onSubmit={sendPostReq}>
                    <Logo />
                    <Textfield onChange={handleChange} name="email" value={email} type="text" label="Email" placeholder="Enter email" icon_cls="fa-solid fa-envelope" />
                    <Textfield className="last" onChange={handleChange} name="password" value={password} type="password" label="Password" placeholder="Enter password" icon_cls="fa-solid fa-lock" />
                    <div className="error-text">{errorMsg}</div>
                    <a className="forgot-pass" href="#">Forgot Password?</a>
                    <PrimaryButton text="LOG IN" disabled={buttonDisabled} />
                    <ORSeparator />
                    <GoogleButton url="#" />
                    <BottomTextLink text="Don't have an account?" link_text="Sign Up" url="/signup" />
                </form>
            </div>
        </>
    )
}

export default LogIn;