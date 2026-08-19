import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    bg: "#0A0D14",
                    surface: "#121824",
                    elevated: "#1A2233",
                    border: "#1E293B",
                    gold: "#F59E0B",
                    goldHover: "#D97706",
                    goldGlow: "rgba(245, 158, 11, 0.25)",
                    ruby: "#E11D48",
                    indigo: "#1E1B4B"
                },
                seat: {
                    available: "#334155",
                    selected: "#F59E0B",
                    locked: "#EA580C",
                    booked: "#1E293B"
                }
            },
            boxShadow: {
                'brand-glow': '0 0 20px -3px rgba(245, 158, 11, 0.3)',
                'surface-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
            }
        }
    },
    plugins: []
}

export default config