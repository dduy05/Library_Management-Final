const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Development vs Production logging can be added here
    console.error(`ERROR 💥: ${err.message}`);

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        // stack: err.stack // Chỉ mở khi debug
    });
};

export default errorMiddleware;
