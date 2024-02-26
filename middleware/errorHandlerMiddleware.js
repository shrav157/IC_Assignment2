// middleware/errorHandlerMiddleware.js

function errorHandlerMiddleware(err, req, res, next) {
    const statusCode = err.statusCode || 500; 
    const message = err.message || 'Internal Server Error';

    // Response object (without environment-based distinction)
    const response = {
        message, 
        // You can still include the stack trace for debugging if needed
        stack: err.stack 
    }; 

    res.status(statusCode).json(response);
}

module.exports = errorHandlerMiddleware;
