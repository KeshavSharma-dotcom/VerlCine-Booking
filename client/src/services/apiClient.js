const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"

const apiClient = async (endpoint, options = {}) => {
    const config = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        credentials: "include",
        ...options
    }

    if (config.body && typeof config.body === "object") {
        config.body = JSON.stringify(config.body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        const error = new Error(data.message || "Something went wrong")
        error.status = response.status
        error.data = data
        throw error
    }

    return data
}

export default apiClient