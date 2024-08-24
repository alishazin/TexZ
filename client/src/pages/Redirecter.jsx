import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

export function Redirecter() {

    const navigator = useNavigate()
    const [cookies, setCookie, removeCookie] = useCookies(["session_token"])

    useEffect(() => {
        if (cookies.session_token) {
            navigator("/rooms")
        } else {
            navigator("/login")
        }
    })
}