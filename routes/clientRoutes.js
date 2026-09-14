import { Router } from 'express'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  inviteClientAccess,
  revokeClientAccess,
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

// Acceso del cliente al portal
router.post('/:id/invite', clientIdRule, validate, inviteClientAccess)
router.delete('/:id/invite', clientIdRule, validate, revokeClientAccess)

export default router