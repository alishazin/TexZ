import "../styles/components/googlebutton.css"
import axios from "axios";

function GoogleButton() {

    async function handleCredentialResponse(res) {
        console.log(res);

        const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${res.access_token}`, {
            headers: {
                Authorization: `Bearer ${res.access_token}`,
                Accept: 'application/json'
            }
        })
        console.log(response.data);
    }

    function handleClick() {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: "63200987513-snm9rc8r2j3bb7mgeiv28hu6kn68q3nt.apps.googleusercontent.com",
            scope: 'https://www.googleapis.com/auth/contacts.readonly',
            callback: tokenResponse => handleCredentialResponse(tokenResponse),
        })
        client.requestAccessToken()
    }

    return (
        <div className="google-but-container" onClick={handleClick}>
            <div className="google-icon"></div>
            <div className="text">Continue with Google</div>
        </div>
    )
}

export default GoogleButton;