const sanitize = (data) => {
    if (typeof data === 'string') {
        return data.replace(/\$/g, '').trim()
    }
    if (Array.isArray(data)) {
        return data.map(sanitize)
    }
    if (data !== null && typeof data === 'object') {
        const sanitizedObj = {}
        for (const key of Object.keys(data)) {
            const cleanKey = key.replace(/\$/g, '')
            sanitizedObj[cleanKey] = sanitize(data[key])
        }
        return sanitizedObj
    }
    return data
}

const dataSan = (req, res, next) => {
    if (req.body) {
        req.body = sanitize(req.body)
    }
    if (req.query) {
        req.query = sanitize(req.query)
    }
    if (req.params) {
        req.params = sanitize(req.params)
    }
    next()
}

module.exports = dataSan