export const requireRole = (roles) => (req, res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles]
  const user = req.currentUser

  if (!user || !allowed.includes(user.role)) {
    return res.status(403).json({ error: 'Acceso denegado' })
  }

  next()
}