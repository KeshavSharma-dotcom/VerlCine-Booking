import React from "react"

const baseProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "landmark-svg"
}

export const CITY_ICONS = {
    "Delhi NCR": (
        <svg {...baseProps}>
            <path d="M4 21h16M5 21V7l2-2h10l2 2v14M8 5V3h8v2M9 21v-8a3 3 0 0 1 6 0v8M7 9h10" />
        </svg>
    ),
    Mumbai: (
        <svg {...baseProps}>
            <path d="M3 21h18M4 21V9l2-2h3l1 2h4l1-2h3l2 2v12M9 21v-7a3 3 0 0 1 6 0v7M6 12h12M9 7V5h6v2" />
        </svg>
    ),
    Bengaluru: (
        <svg {...baseProps}>
            <path d="M3 21h18M4 21v-8l2-2h12l2 2v8M10 21v-5a2 2 0 0 1 4 0v5M12 3v8M9 7l3-4 3 4M7 13h10" />
        </svg>
    ),
    Ahmedabad: (
        <svg {...baseProps}>
            <path d="M3 21h18M5 21V9a7 7 0 0 1 14 0v12M9 21v-5a3 3 0 0 1 6 0v5M5 14h14M12 9v5" />
        </svg>
    ),
    Chandigarh: (
        <svg {...baseProps}>
            <path d="M12 21v-6M9 15h6M7 12l2-4 3 1 2-4 3 2 1 5-2 3H8l-1-3zM10 4V2h4v2" />
        </svg>
    ),
    Chennai: (
        <svg {...baseProps}>
            <path d="M4 21h16M9 3h6l-1 4H10L9 3zM8 7h8l-1 5H9L8 7zM7 12h10l-1 5H8l-1-5zM6 17h12v4H6v-4zM11 21v-2a1 1 0 0 1 2 0v2" />
        </svg>
    ),
    Pune: (
        <svg {...baseProps}>
            <path d="M3 21h18M4 21V8l2-2h3v15M15 21V6h3l2 2v13M9 21v-7a3 3 0 0 1 6 0v7M4 11h16M9 9h6" />
        </svg>
    ),
    Kolkata: (
        <svg {...baseProps}>
            <path d="M2 19h20M3 19l4-14 5 5 5-5 4 14M7 5v14M17 5v14M7 10h10M4 15h16" />
        </svg>
    ),
    Hyderabad: (
        <svg {...baseProps}>
            <path d="M4 21h16M5 21V4M19 21V4M8 21v-6a4 4 0 0 1 8 0v6M5 10h14M5 6h14M7 4h2M15 4h2" />
        </svg>
    ),
    Goa: (
        <svg {...baseProps}>
            <path d="M3 21h18M12 21c0-6 2-10 6-12M18 9c-3-2-6-1-7 2 2 1 5 1 7-2zM18 9c0-3-3-5-6-4 1 3 3 4 6 4zM18 9c2-3 1-6-2-6 0 3 1 5 2 6zM5 14a4 4 0 0 1 4-4M3 18c3-1 6-1 9 0" />
        </svg>
    ),
    Jaipur: (
        <svg {...baseProps}>
            <path d="M3 21h18M5 21V10l7-6 7 6v11M10 21v-4a2 2 0 0 1 4 0v4M8 12h2M14 12h2M10 8h4M6 16h2M16 16h2" />
        </svg>
    ),
    "Abu Dhabi": (
        <svg {...baseProps}>
            <path d="M2 21h20M4 21V8M20 21V8M8 21V13a4 4 0 0 1 8 0v8M12 6c-2 0-3-2-3-3s1-1 3-1 3 0 3 1-1 3-3 3zM6 13h12" />
        </svg>
    )
}

export default CITY_ICONS