import "../styles/components/navbar.css"
import TextLogoImg from "../images/text-logo.png"
import LogoImg from "../images/logo.png"
import { Icon } from '@iconify/react';
import { Link } from "react-router-dom";

function NavBar({ instance }) {

    return (
        <>
        <div className="top-content">
            <img className="text-logo" src={TextLogoImg} />
            <img className="logo" src={LogoImg} />
        </div>
        <div className="separator"></div>
        <Link className={`nav-item-container ${[1,2,3].includes(instance) ? "active" : ""}`} to="/login">
            <Icon className="icon flip" icon="lets-icons:chat" />
            <span>Rooms</span>
        </Link>
        <Link className={`sub-nav-item-container ${instance === 2 ? "active" : ""}`} to="/create-room">
            <div className="side-bar"></div>
            <span>Create a Room</span>
        </Link>
        <Link className={`sub-nav-item-container ${instance === 3 ? "active" : ""}`} to="/join-room">
            <div className="side-bar"></div>
            <span>Join a Room</span>
        </Link>
        <Link className={`nav-item-container ${instance === 4 ? "active" : ""}`} to="/login">
            <Icon className="icon" icon="line-md:cog" />
            <span>Settings</span>
        </Link>
        </>
    )
}

export default NavBar;