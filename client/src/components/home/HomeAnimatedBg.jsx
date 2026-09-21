import React from "react"
import "../../assets/styles/animatedBg.css"

export const HomeAnimatedBg = ({ quadPosters }) => {
    return (
        <div className="animated-bg-viewport">
            <div className="animated-quad-canvas">
                {quadPosters.map((url, idx) => (
                    <div key={idx} className="animated-quad-tile">
                        <img src={url} alt="" className="animated-quad-img" />
                    </div>
                ))}
            </div>
            <div className="animated-bg-overlay" />
        </div>
    )
}

export default HomeAnimatedBg