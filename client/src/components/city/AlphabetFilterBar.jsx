import React from "react"

export const AlphabetFilterBar = ({ alphabets, activeLetter, groupedCities, onLetterClick }) => {
    return (
        <div className="city-alphabet-bar">
            {alphabets.map((letter) => {
                const letterCities = groupedCities[letter] || []
                const hasCities = letterCities.length > 0
                return (
                    <button
                        key={letter}
                        disabled={!hasCities}
                        className={`alphabet-letter-btn ${activeLetter === letter ? "active" : ""} ${!hasCities ? "disabled" : ""
                            }`}
                        onClick={() => onLetterClick(letter)}
                    >
                        {letter}
                    </button>
                )
            })}
        </div>
    )
}

export default AlphabetFilterBar