import "../styles/components/googlebutton.css"

function GoogleButton({ url }) {

    return (
        <a className="google-but-container" href="#">
            <div className="google-icon"></div>
            <div className="text">Continue with Google</div>
        </a>
    )
}

export default GoogleButton;