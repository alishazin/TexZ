import "../styles/components/navbar.css"
import TextLogoImg from "../images/text-logo.png"
import LogoImg from "../images/logo.png"
import { Icon } from '@iconify/react';

function NavBar() {

    return (
        <>
        <div className="top-content">
            <img className="text-logo" src={TextLogoImg} />
            <img className="logo" src={LogoImg} />
        </div>
        <div className="separator"></div>
        <div className="nav-item-container active">
            <Icon className="icon flip" icon="lets-icons:chat" />
            <span>Rooms</span>
        </div>
        <div className="sub-nav-item-container active">
            <div className="side-bar"></div>
            <span>Create a Room</span>
        </div>
        <div className="sub-nav-item-container">
            <div className="side-bar"></div>
            <span>Join a Room</span>
        </div>
        <div className="nav-item-container">
            <Icon className="icon" icon="line-md:cog" />
            <span>Settings</span>
        </div>
        </>
    )
}

export default NavBar;