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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookies } from 'react-cookie'

const instanceText = {
    "0": "Session expired.",
    "1": "Password changed successfully.",
    "2": "Password resetted successfully.",
    "3": "Reset password link expired.",
}

function LogIn() {
    
    let navigate = useNavigate()
    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [searchParams] = useSearchParams();
    const instance = searchParams.get('i')

    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        if (password.length >= 8 && email.trim().length > 0) setButtonDisabled(false)
        else setButtonDisabled(true)
    }, [email, password])

    useEffect(() => {
        document.title = "Log In"

        window.google.accounts.id.initialize({
            client_id: "63200987513-snm9rc8r2j3bb7mgeiv28hu6kn68q3nt.apps.googleusercontent.com",
            callback: async (res) => {
                try {
                    const response = await axios.post("http://localhost:3000/api/auth/signin/google", {
                        jwt_encoded: res.credential
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
        })

        window.google.accounts.id.renderButton(
            document.querySelector(".google-but-container"),
            {theme: "outline", width: "300"}
        )
    }, [])

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
                    {instance && instanceText[instance] && <div className="help-text">{instanceText[instance]}</div>}
                    <div className="error-text">{errorMsg}</div>
                    <a className="forgot-pass" href="/forgot-password">Forgot Password?</a>
                    <PrimaryButton text="LOG IN" disabled={buttonDisabled} />
                    <ORSeparator />
                    <GoogleButton />
                    <BottomTextLink text="Don't have an account?" link_text="Sign Up" url="/signup" />
                </form>
            </div>
        </>
    )
}

export default LogIn;