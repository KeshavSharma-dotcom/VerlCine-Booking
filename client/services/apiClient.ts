const API_BASE_URL: string = 'http://localhost:5000/api'

export interface ApiResponse<T = unknown> {
    success: boolean
    message?: string
    [key: string]: unknown
}

export const fetchClient = async <T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        credentials: 'include',
        ...options
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'API Request Failed')
    }

    return data as T
}