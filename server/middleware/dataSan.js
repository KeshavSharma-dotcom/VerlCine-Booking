const isPlainObject = (obj) => {
    return Object.prototype.toString.call(obj) === "[object Object]"
}

const sanitize = (data) => {
    if (Array.isArray(data)) {
        return data.map(item => sanitize(item))
    }

    if (isPlainObject(data)) {
        const sanitizedObj = {}
        for (const key of Object.keys(data)) {
            if (key === "__proto__" || key === "constructor" || key === "prototype") {
                continue
            }
            const cleanKey = key.replace(/[$.]/g, "")
            sanitizedObj[cleanKey] = sanitize(data[key])
        }
        return sanitizedObj
    }

    return data
}

const cleanObjectInPlace = (target) => {
    if (!target || typeof target !== "object") return
    for (const key of Object.keys(target)) {
        if (key.includes("$") || key.includes(".")) {
            delete target[key]
            continue
        }
        if (isPlainObject(target[key]) || Array.isArray(target[key])) {
            target[key] = sanitize(target[key])
        }
    }
}

const dataSan = (req, res, next) => {
    if (req.body && isPlainObject(req.body)) {
        req.body = sanitize(req.body)
    }
    if (req.query) {
        cleanObjectInPlace(req.query)
    }
    if (req.params) {
        cleanObjectInPlace(req.params)
    }
    next()
}

module.exports = dataSan