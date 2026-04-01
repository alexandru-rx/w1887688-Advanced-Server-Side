function requireAuth(req, res, next) {

// Middleware used protect routes by ensuring the user is authenticated via session

  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      message: "You must be logged in to access this resource"
    });
  }

  next();
}

module.exports = requireAuth;