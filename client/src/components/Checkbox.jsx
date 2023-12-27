import "../styles/components/checkbox.css"
import { Icon } from '@iconify/react'
import { useState } from "react"

function Checkbox({ label, subLabel, className, onChange, name, style, checkboxState, setCheckboxState }) {

    const handleClick = () => {
        setCheckboxState(prevValue => !prevValue)
    }

    return (
        <div className={`checkbox-container ${className ? className : ""}`} style={style}>
            <label>{label}<br/><div className="sub-label">{subLabel}</div></label>
            {checkboxState && <Icon icon="mdi:checkbox-outline" className="box on" onClick={handleClick} />}
            {!checkboxState && <Icon icon="ri:checkbox-blank-line" className="box off" onClick={handleClick} />}
        </div>
    )
}

export default Checkbox;