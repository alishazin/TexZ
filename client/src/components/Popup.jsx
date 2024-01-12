import "../styles/components/popup.css"
import { useState } from "react"
import PrimaryButton from "./PrimaryButton"
import { Icon } from '@iconify/react'

function Popup({ popupObj, setPopupObj }) {

    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [buttonLoading, setButtonLoading] = useState(false)

    const closePopup = () => {
        setPopupObj({
            state: false,
            text: "",
            confirmation_text: "",
            button_text: "",
            callback: async () => {}
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!buttonDisabled && !buttonLoading) {
            setButtonLoading(true)
            await popupObj.callback()
            setButtonLoading(false)
            closePopup()
        }
    }

    const handleChange = (e) => {
        if (e.target.value === popupObj.confirmation_text)
            setButtonDisabled(false)
        else 
            setButtonDisabled(true)
    }

    const handleParentClick = (e) => {
        if (e.target === e.currentTarget && !buttonLoading) closePopup()
    }


    return (
        <div className="popup-container" onClick={handleParentClick}>
            <form className="popup-content" onSubmit={handleSubmit} >
                <div className="text">{popupObj.text}</div>
                <div className="help-text">Type '{popupObj.confirmation_text}'</div>
                <input onChange={handleChange} className="field" placeholder={popupObj.confirmation_text} />
                <PrimaryButton text={popupObj.button_text} disabled={buttonDisabled} loading={buttonLoading} />
            </form>
        </div>
    )
}

export default Popup;