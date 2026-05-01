export function authMiddleware(req, res, next) {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please log in' });
        }
        
        // User is authenticated via session
        req.userId = req.session.userId;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}