import "../styles/components/infocontainer.css"
import { Icon } from '@iconify/react'

function InfoContainer({ content }) {

    return (
        <div className="info-container">
            <Icon className="icon" icon="material-symbols:info-outline" />
            <span>{content}</span>
        </div>
    )
}

export default InfoContainer;