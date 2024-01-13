import "../styles/components/tertiarybutton.css"
import { Icon } from '@iconify/react'

function TertiaryButton({ text, disabled, onClick, loading = false }) {

    return (
        <button onClick={onClick} className={`ter-but ${disabled ? "disabled" : ""} ${loading ? "loading" : ""}`}>{loading ? <Icon icon="line-md:loading-alt-loop" /> : text}</button>
    )
}

export default TertiaryButton;