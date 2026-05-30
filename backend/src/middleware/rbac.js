module.exports = {
  checkRole: (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Access Denied: Unauthenticated' });
      }

      const { role } = req.user;
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ 
          error: `Access Denied: User role '${role}' is unauthorized to access this resource` 
        });
      }

      next();
    };
  }
};
