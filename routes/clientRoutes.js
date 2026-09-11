import { Router } from 'express'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from '../middlewares/validate.js'
import {
  clientIdRule,
  createClientRules,
  updateClientRules,
} from '../validators/clientValidators.js'

const router = Router()

router.use(authenticateToken)

router.get('/', getClients)
router.get('/:id', clientIdRule, validate, getClientById)
router.post('/', createClientRules, validate, createClient)
router.put('/:id', clientIdRule, updateClientRules, validate, updateClient)
router.delete('/:id', clientIdRule, validate, deleteClient)

export default router