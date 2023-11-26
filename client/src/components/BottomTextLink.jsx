import "../styles/components/bottomtextlink.css"

function BottomTextLink({ text, link_text, url }) {

    return (
        <div className="bottom-textlink-container">
            <div className="text">{text}</div>
            <a href={url} className="link">{link_text}</a>
        </div>
    )
}

export default BottomTextLink;