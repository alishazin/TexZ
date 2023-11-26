import "../styles/login.css"
import Background from "../components/Background"
import Textfield from "../components/Textfield"
import PrimaryButton from "../components/PrimaryButton"
import ORSeparator from "../components/ORSeparator"
import GoogleButton from "../components/GoogleButton"
import BottomTextLink from "../components/BottomTextLink"
import Logo from "../components/Logo"

function LogIn() {
    return (
        <>
            <Background />
            <div className="login-page">
                <div className="container">
                    <Logo />
                    <Textfield type="text" label="Username" placeholder="Enter username" icon_cls="fa-solid fa-envelope" />
                    <Textfield className="last" type="text" label="Password" placeholder="Enter password" icon_cls="fa-solid fa-lock" />
                    <a className="forgot-pass" href="#">Forgot Password?</a>
                    <PrimaryButton text="LOG IN" />
                    <ORSeparator />
                    <GoogleButton url="#" />
                    <BottomTextLink text="Don't have an account?" link_text="Sign Up" url="#" />
                </div>
            </div>
        </>
    )
}

export default LogIn;