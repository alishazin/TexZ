import "../styles/signup.css"
import Background from "../components/Background"
import Logo from "../components/Logo"
import TextLogo from "../components/TextLogo"
import SecondaryButton from "../components/SecondaryButton"
import Textfield from "../components/Textfield"
import PrimaryButton from "../components/PrimaryButton"
import ORSeparator from "../components/ORSeparator"
import GoogleButton from "../components/GoogleButton"

function SignUp() {

    return (
        <div className="signup-page">
            <Background />
            <div className="container">
                <div className="left-content">
                    <Logo />
                    <TextLogo />
                    <p className="text"><span>"</span>Create a room and start texzing<span>"</span></p>
                    <p style={{marginTop: "90px"}}>Already have an account?</p>
                    <SecondaryButton text="LOGIN" />
                </div>
                <div className="separator"></div>
                <div className="right-content">
                    <Textfield type="text" label="Email" placeholder="Enter email" icon_cls="fa-solid fa-envelope" />
                    <Textfield type="text" label="Username" placeholder="Enter username" icon_cls="fa-solid fa-envelope" />
                    <Textfield type="text" label="Password" placeholder="Enter password" icon_cls="fa-solid fa-envelope" />
                    <Textfield type="text" label="Repeat Password" placeholder="Repeat password" icon_cls="fa-solid fa-envelope" />
                    <PrimaryButton text="SIGN UP" />
                    <ORSeparator />
                    <GoogleButton url="#" />
                </div>
            </div>
        </div>
    )
}

export default SignUp;