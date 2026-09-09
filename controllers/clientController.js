import prisma from '../db.js';

// 1. Obtener todos los clientes
export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// 2. Obtener un solo cliente por ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
};

// 3. Crear un nuevo cliente
export const createClient = async (req, res) => {
  try {
    const { name, email, phone, status, paymentStatus, userId } = req.body;

    // Validación básica de campos requeridos
    if (!name || !userId) {
      return res.status(400).json({ error: 'El nombre y el userId son obligatorios' });
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        status,
        paymentStatus,
        trainer: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error detallado al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
};

// 4. Actualizar un cliente
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, paymentStatus } = req.body;

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { name, email, phone, status, paymentStatus },
    });

    res.json(updatedClient);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

// 5. Eliminar un cliente
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.client.delete({
      where: { id },
    });

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
};