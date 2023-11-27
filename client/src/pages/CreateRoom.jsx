import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function CreateRoom() {

    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])
    const [userObj, setUserObj] = useState(null)

    const navigate = useNavigate()
    const session_token = cookies.session_token

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
            setUserObj(response.data)
        } catch(err) {
            if (err.response.status === 400) {
                removeCookie("session_token")
                navigate("/login")
            }
            console.log(err);
        }
    }

    return (
        <>
        {userObj && <>
            <p>Dashboard</p>
        </>}
        </>
    )
}

export default CreateRoom;