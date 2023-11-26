import "../styles/components/textfield.css"

function Textfield({ type, label, placeholder, icon_cls, className, value, onChange, name }) {

    return (
        <div className={`textfield-container ${className ? className : ""}`}>
            <label>{label}</label>
            <div className="field">
                <input type={type} placeholder={placeholder} value={value} onChange={onChange} name={name} autoComplete={type === "password" ? "new-password" : ""} />
                <i className={icon_cls} />
            </div>
        </div>
    )
}

export default Textfield;