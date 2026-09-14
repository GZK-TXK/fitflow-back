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
        account: { select: { email: true } },
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

export const inviteClientAccess = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const client = await prisma.client.findFirst({ where: { id, userId } })
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin permisos' })
    }

    if (!client.email) {
      return res.status(400).json({ error: 'El cliente necesita un email para darle acceso' })
    }

    const email = client.email.trim().toLowerCase()
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser && existingUser.role !== 'CLIENT') {
      return res
        .status(409)
        .json({ error: 'Ese email ya pertenece a una cuenta de entrenador o admin' })
    }

    const account =
      existingUser ||
      (await prisma.user.create({
        data: { email, name: client.name, role: 'CLIENT' },
      }))

    const linkedElsewhere = await prisma.client.findFirst({
      where: { accountUserId: account.id, NOT: { id: client.id } },
    })
    if (linkedElsewhere) {
      return res.status(409).json({ error: 'Esa cuenta ya está vinculada a otro cliente' })
    }

    await prisma.client.update({
      where: { id: client.id },
      data: { accountUserId: account.id },
    })

    return res.status(200).json({
      message: 'Acceso concedido. El cliente puede entrar con Google usando ese email.',
      accountEmail: account.email,
    })
  } catch (error) {
    return next(error)
  }
}

export const revokeClientAccess = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const client = await prisma.client.findFirst({ where: { id, userId } })
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin permisos' })
    }

    await prisma.client.update({
      where: { id: client.id },
      data: { accountUserId: null },
    })

    return res.status(200).json({ message: 'Acceso revocado' })
  } catch (error) {
    return next(error)
  }
}