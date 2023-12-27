import "../styles/components/textfield2.css"

function Textfield2({ instance = 0, type, label, placeholder, className, value, onChange, name, style }) {

    return (
        <div className={`textfield2-container ${className ? className : ""}`} style={style}>
            <label>{label}</label>
            {instance === 0 && <input type={type} placeholder={placeholder} value={value} onChange={onChange} name={name} autoComplete={type === "password" ? "new-password" : ""} />}
            {instance === 1 && <textarea type={type} placeholder={placeholder} value={value} onChange={onChange} name={name} autoComplete={type === "password" ? "new-password" : ""} />}
        </div>
    )
}

export default Textfield2;