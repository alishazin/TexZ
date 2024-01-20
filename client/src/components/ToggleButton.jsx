import "../styles/components/togglebutton.css"

function ToggleButton({ disabled, state, handleClick }) {

    return (
        <div onClick={handleClick} className={`toggle-button ${disabled ? 'disabled' : ''} ${state ? 'on' : 'off'}`}>
            <div className="toggle-div"></div>
        </div>
    )
}

export default ToggleButton;