// middleware/bodyParsingMiddleware.js
const express = require('express');

// Body-parsing middleware
const bodyParser = {
    json: express.json(), // Parses JSON request bodies
    urlencoded: express.urlencoded({ extended: true }) // Parses URL-encoded request bodies
};

// Middleware function
function bodyParsingMiddleware(req, res, next) {
    bodyParser.json(req, res, (err) => {
        if (err) { 
            // If there's a JSON parsing error, handle it (e.g., return a 400 with an error message)
            return res.status(400).json({ error: 'Invalid JSON payload' });
        }
        next();
    });

    bodyParser.urlencoded(req, res, (err) => {
        if (err) {
            // Similar error handling for URL-encoded data
            return res.status(400).json({ error: 'Invalid URL-encoded payload' }); 
        }
        next();
    });
}

module.exports = bodyParsingMiddleware;
