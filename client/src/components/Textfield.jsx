import "../styles/components/textfield.css"

function Textfield({ type, label, placeholder, icon_cls, className }) {

    return (
        <div className={`textfield-container ${className ? className : ""}`}>
            <label>{label}</label>
            <div className="field">
                <input type={type} placeholder={placeholder} />
                <i className={icon_cls} />
            </div>
        </div>
    )
}

export default Textfield;