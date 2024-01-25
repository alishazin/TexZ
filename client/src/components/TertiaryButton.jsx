import "../styles/components/tertiarybutton.css"
import { Icon } from '@iconify/react'

function TertiaryButton({ type = "button", text, disabled, onClick, loading = false, url }) {

    return (
        <>
            {type === "button" && <button onClick={onClick} className={`ter-but ${disabled ? "disabled" : ""} ${loading ? "loading" : ""}`}>{loading ? <Icon icon="line-md:loading-alt-loop" /> : text}</button>}
            {type === "url" && <a href={url} onClick={onClick} className={`ter-but ${disabled ? "disabled" : ""} ${loading ? "loading" : ""}`}>{loading ? <Icon icon="line-md:loading-alt-loop" /> : text}</a>}
        </>
    )
}

export default TertiaryButton;