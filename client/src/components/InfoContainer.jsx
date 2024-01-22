import "../styles/components/infocontainer.css"
import { Icon } from '@iconify/react'

function InfoContainer({ content, isLast, messagesEndRef }) {

    return (
        <div className="info-container" ref={isLast ? messagesEndRef : null}>
            <Icon className="icon" icon="material-symbols:info-outline" />
            <span>{content}</span>
        </div>
    )
}

export default InfoContainer;