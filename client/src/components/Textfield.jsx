import "../styles/components/textfield.css"

function Textfield({ type, label, placeholder, icon_cls }) {

    return (
        <div className="textfield-container">
            <label>{label}</label>
            <div className="field">
                <input type={type} placeholder={placeholder} />
                <i className={icon_cls} />
            </div>
        </div>
    )
}

export default Textfield;