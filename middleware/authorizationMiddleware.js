// middleware/authorizationMiddleware.js
function authorizationMiddleware(requiredPermissions) {
    return function(req, res, next) {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const userPermissions = req.user.permissions; // Assuming permissions exist on the user object
        if (!userPermissions.some(permission => requiredPermissions.includes(permission))) {
            return res.status(403).json({ error: 'Forbidden' }); 
        }

        next();
    }
}

module.exports = authorizationMiddleware;
