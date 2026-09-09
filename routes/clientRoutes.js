import { Router } from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Aplicar el middleware a todas las rutas de este router
router.use(authenticateToken);

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;