import "../styles/login.css"
import { useState, useEffect } from "react"
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
    const [userObj, setUserObj] = useState(null)
    console.log(userObj);

    const [allDisabled, setAllDisabled] = useState(false)
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [passwordOld, setPasswordOld] = useState("")
    const [passwordNew, setPasswordNew] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const session_token = cookies.session_token

    useEffect(() => {
        if (!allDisabled) {
            if (passwordOld.length >= 8 && passwordNew.length >= 8) setButtonDisabled(false)
            else setButtonDisabled(true)
        }
    }, [passwordOld, passwordNew])

    useEffect(() => {
        document.title = "Change Password"
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
            if (response.data.provider == "google") {
                setErrorMsg("Account with the given email is authenticated using google")
                setAllDisabled(true)
            }
            setUserObj(response.data)
        } catch(err) {
            if (err.response.status === 400) {
                removeCookie("session_token")
                navigate("/login?i=0")
            }
            console.log(err);
        }
    }

    const handleChange = function (event) {
        if (event.target.name === "old-password") setPasswordOld(event.target.value)
        else if (event.target.name === "new-password") setPasswordNew(event.target.value)
    }

    const sendPostReq = async function (e) {
        e.preventDefault()
        if (buttonDisabled) return
        
        try {
            const response = await axios.post("http://localhost:3000/api/auth/change-password", {
                session_token: session_token,
                old_password: passwordOld,
                new_password: passwordNew,
            })
            removeCookie("session_token")
            navigate("/login?i=1")
        } catch(err) {
            if (err.response.status === 400) {
                setErrorMsg(err.response.data.err_msg)
            }
            else if (err.response.status === 401) {
                removeCookie("session_token")
                navigate("/login?i=0")
            }
            console.log(err);
        }
    }

    return (
        <>
        {userObj && <>
            <Background />
            <div className="login-page">
                <form className="container" onSubmit={sendPostReq} style={{height: "450px"}}>
                    <TextLogo />
                    <input type="text" name="email" autoComplete="email" defaultValue={userObj.email} hidden/>
                    <Textfield onChange={handleChange} name="old-password" value={passwordOld} type="password" label="Old Password" placeholder="Enter old password" icon_cls="fa-solid fa-lock" />
                    <Textfield className="last" onChange={handleChange} name="new-password" value={passwordNew} type="password" label="New Password" placeholder="Repeat new password" icon_cls="fa-solid fa-lock" />
                    <div className="error-text" style={{margin: "10px 0 30px"}}>{errorMsg}</div>
                    <PrimaryButton text="CHANGE PASSWORD" disabled={buttonDisabled} />
                </form>
            </div>
        </>}
        </>
    )
}

export default ChangePassword;