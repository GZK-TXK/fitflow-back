import { Router } from 'express'
import {
  getStats,
  getTrainers,
  updateTrainerRole,
  deleteTrainer,
} from '../controllers/adminController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/requireRole.js'
import { validate } from '../middlewares/validate.js'
import { trainerIdRule, updateRoleRules } from '../validators/adminValidators.js'

const router = Router()

router.use(authenticateToken, requireRole('ADMIN'))

router.get('/stats', getStats)
router.get('/trainers', getTrainers)
router.put('/trainers/:id/role', trainerIdRule, updateRoleRules, validate, updateTrainerRole)
router.delete('/trainers/:id', trainerIdRule, validate, deleteTrainer)

export default router