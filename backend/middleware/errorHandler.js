const errorHandler = (err, req, res, next) => {
    const currStatus = res.statusCode === 200 ? 500 : res.statusCode
    console.error(`Global error intercepted`, err.stack || err.message)
    res.status(currStatus).json({
        success: false,
        message: err.message || "Server Crash",
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
}
module.exports = errorHandler