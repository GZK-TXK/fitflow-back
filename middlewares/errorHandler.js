import { Prisma } from '@prisma/client'

export const errorHandler = (err, req, res, next) => {
  // Error de CORS lanzado desde el callback de cors()
  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: 'Origen no permitido' })
  }

  // Errores de body-parser
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON mal formado en el cuerpo de la petición' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande' })
  }

  // Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2025': // Registro no encontrado
        return res.status(404).json({ error: 'Recurso no encontrado' })
      case 'P2002': // Violación de campo único
        return res.status(409).json({ error: 'Ya existe un registro con esos datos' })
      case 'P2003': // Falla de clave foránea
        return res.status(400).json({ error: 'Referencia inválida en los datos enviados' })
      default:
        break
    }
  }

  // Errores HTTP que ya traen su propio status (p. ej. body-parser)
  const status = err.status || err.statusCode
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({ error: 'Solicitud inválida' })
  }

  // Error no controlado
  console.error('Error no controlado:', err)
  return res.status(500).json({ error: 'Error interno del servidor' })
}