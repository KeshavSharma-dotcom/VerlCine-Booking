const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const fetchClient = async (endpoint, options = {}) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include',
        ...options
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.message || 'API request failed')
    }

    return data
}