import "../styles/components/togglebutton.css"

function ToggleButton({ disabled, state, setState, prevValue }) {

    const handleClick = () => {
        if (!disabled) {
            setState(prev => {
                prevValue.current = prev
                return !prev
            })
        }
    }

    return (
        <div onClick={handleClick} className={`toggle-button ${disabled ? 'disabled' : ''} ${state ? 'on' : 'off'}`}>
            <div className="toggle-div"></div>
        </div>
    )
}

export default ToggleButton;