import prisma from '../db.js'

export const getClients = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(clients)
  } catch (error) {
    return next(error)
  }
}

export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const client = await prisma.client.findFirst({
      where: { id, userId },
      include: {
        workouts: true,
        account: { select: { email: true, status: true } },
      },
    })

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }

    return res.status(200).json(client)
  } catch (error) {
    return next(error)
  }
}

export const createClient = async (req, res, next) => {
  try {
    const { name, email, phone, notes } = req.body
    const userId = req.user.userId

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        notes,
        user: { connect: { id: userId } },
      },
    })

    return res.status(201).json(newClient)
  } catch (error) {
    return next(error)
  }
}

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, email, phone, notes } = req.body
    const userId = req.user.userId

    const existingClient = await prisma.client.findFirst({ where: { id, userId } })
    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin permisos' })
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { name, email, phone, notes },
    })

    return res.status(200).json(updatedClient)
  } catch (error) {
    return next(error)
  }
}

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const existingClient = await prisma.client.findFirst({ where: { id, userId } })
    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin permisos' })
    }

    await prisma.client.delete({ where: { id } })

    return res.status(200).json({ message: 'Cliente eliminado correctamente' })
  } catch (error) {
    return next(error)
  }
}

export const updateClientAccess = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = req.user.userId

    const client = await prisma.client.findFirst({ where: { id, userId } })
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin permisos' })
    }

    if (!client.accountUserId) {
      return res.status(400).json({ error: 'El cliente aún no se ha registrado' })
    }

    await prisma.user.update({
      where: { id: client.accountUserId },
      data: { status },
    })

    return res.status(200).json({
      message: status === 'ACTIVE' ? 'Acceso concedido' : 'Acceso revocado',
    })
  } catch (error) {
    return next(error)
  }
}