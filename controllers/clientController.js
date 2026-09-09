import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los clientes del usuario autenticado
export const getClients = async (req, res) => {
  try {
    const userId = req.user.userId;

    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(clients);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return res.status(500).json({ error: 'Error al obtener la lista de clientes' });
  }
};

// Obtener un cliente específico por ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId, // Garantiza que solo el dueño del cliente pueda acceder
      },
      include: {
        workouts: true,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    return res.status(200).json(client);
  } catch (error) {
    console.error('Error al obtener el cliente:', error);
    return res.status(500).json({ error: 'Error al obtener los detalles del cliente' });
  }
};

// Crear un nuevo cliente
export const createClient = async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: 'El nombre del cliente es obligatorio' });
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        notes,
        user: {
          connect: { id: userId }, // Utiliza 'user' respetando el schema.prisma
        },
      },
    });

    return res.status(201).json(newClient);
  } catch (error) {
    console.error('Error detallado al crear cliente:', error);
    return res.status(500).json({ error: 'Error al crear el cliente' });
  }
};

// Actualizar un cliente existente
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, notes } = req.body;
    const userId = req.user.userId;

    // Verificar pertenencia del cliente
    const existingClient = await prisma.client.findFirst({
      where: { id, userId },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin permisos' });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { name, email, phone, notes },
    });

    return res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

// Eliminar un cliente
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar pertenencia del cliente
    const existingClient = await prisma.client.findFirst({
      where: { id, userId },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin permisos' });
    }

    await prisma.client.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
};