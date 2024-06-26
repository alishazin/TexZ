import "../styles/signup.css"
import Background from "../components/Background"
import Logo from "../components/Logo"
import TextLogo from "../components/TextLogo"
import SecondaryButton from "../components/SecondaryButton"
import Textfield from "../components/Textfield"
import PrimaryButton from "../components/PrimaryButton"
import ORSeparator from "../components/ORSeparator"
import GoogleButton from "../components/GoogleButton"
import BottomTextLink from "../components/BottomTextLink"
import EmailVer from "../components/EmailVer"
import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function SignUp() {
    
    const navigate = useNavigate()
    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])

    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [buttonLoading, setButtonLoading] = useState(false)
    const [accountCreated, setAccountCreated] = useState(false)

    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")
    
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        if (password === passwordRepeat && password.length >= 8 && email.trim().length > 0 && username.trim().length > 0) setButtonDisabled(false)
        else setButtonDisabled(true)
    }, [email, username, password, passwordRepeat])

    useEffect(() => {
        document.title = "Sign Up"
        
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
        else if (event.target.name === "name") setUsername(event.target.value)
        else if (event.target.name === "password") setPassword(event.target.value)
        else if (event.target.name === "repeat-password") setPasswordRepeat(event.target.value)
    }

    const sendPostReq = async function (e) {
        e.preventDefault()
        if (buttonDisabled) return
        
        try {
            setButtonLoading(true)
            const response = await axios.post("http://localhost:3000/api/auth/signup", {
                email: email.trim(),
                username: username.trim(),
                password
            })
            setErrorMsg("")
            setEmail(response.data.email)
            setButtonLoading(false)
            setAccountCreated(true)
        } catch(err) {
            if (err.response.status === 400) {
                setErrorMsg(err.response.data.err_msg)
            }
            setButtonLoading(false)
            console.log(err);
        }
    }
    
    return (
        <>
        <Background />
        <div className="signup-page">
            <div className="container">
                <div className="left-content">
                    <Logo />
                    <TextLogo />
                    <p className="text"><span>"</span>Create a room and start texzing<span>"</span></p>
                    <p style={{marginTop: "90px"}}>Already have an account?</p>
                    <SecondaryButton type="url" text="LOGIN" url="/login" />
                </div>
                <div className="separator"></div>
                <div className="right-content">
                    {!accountCreated && <>
                        <form onSubmit={sendPostReq}>
                            <Logo />
                            <Textfield onChange={handleChange} name="email" value={email} type="text" label="Email" placeholder="Enter email" icon_cls="fa-solid fa-envelope" />
                            <Textfield onChange={handleChange} name="name" value={username} type="text" label="Username" placeholder="Enter username" icon_cls="fa-solid fa-user" />
                            <Textfield onChange={handleChange} name="password" value={password} type="password" label="Password" placeholder="Enter password" icon_cls="fa-solid fa-lock" />
                            <Textfield onChange={handleChange} name="repeat-password" value={passwordRepeat} type="password" label="Repeat Password" placeholder="Repeat password" icon_cls="fa-solid fa-lock" />
                            <div className="error-text">{errorMsg}</div>
                            <PrimaryButton onClick={sendPostReq} text="SIGN UP" disabled={buttonDisabled} loading={buttonLoading} />
                            <ORSeparator />
                            <GoogleButton />
                            <BottomTextLink text="Already have an account?" link_text="Log In" url="/login" />
                        </form>
                    </>}
                    {accountCreated && <>
                        <EmailVer text={`Check your email '${email}' for verification link. Verification link will expire in 10 minutes.`} />
                    </>}
                </div>
            </div>
        </div>
        </>
    )
}

export default SignUp;