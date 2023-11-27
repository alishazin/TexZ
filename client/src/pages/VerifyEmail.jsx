import "../styles/verifyemail.css"
import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom"
import axios from "axios"
import SecondaryButton from "../components/SecondaryButton"

function VerifyEmail() {

    const { verification_token } = useParams()
    const [verified, setVerified] = useState(null)
    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    console.log(cookies);
    let navigate = useNavigate()

    useEffect(() => {
        document.title = "Verify Account"
        verifyEmail()
    }, [])

    const verifyEmail = async function() {
        try {
            const response = await axios.post(`http://localhost:3000/api/auth/verify-account/`, {
                verification_token: verification_token
            })
            setCookie("session_token", response.data.session_token)
            setVerified(true)
        } catch(err) {
            if (err.response.status === 400) {
                setVerified(false)
            }
            console.log(err);
        }
    }

    return (
        <div className="verify-email-container">
            {verified === null && <p>Verifying...</p>}
            {verified === true && <>
                <p>Successfully Verified</p>
                <SecondaryButton type="url" text="Go Home" url="/create-room" />
            </>
            }
            {verified === false && <>
                <p>Verification failed. Invalid token</p>
                <SecondaryButton type="url" text="Go Home" url="/create-room" />
            </>
            }
        </div>
    )
}

export default VerifyEmail;