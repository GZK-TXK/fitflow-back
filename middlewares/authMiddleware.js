import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: token no proporcionado' })
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    })
    req.user = verified // { userId, email, iat, exp }
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
}