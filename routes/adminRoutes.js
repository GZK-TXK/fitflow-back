import { Router } from 'express'
import {
  getStats,
  getTrainers,
  getUsers,
  updateUserStatus,
  updateTrainerRole,
  deleteTrainer,
} from '../controllers/adminController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/requireRole.js'
import { validate } from '../middlewares/validate.js'
import {
  trainerIdRule,
  userIdRule,
  updateRoleRules,
  updateUserStatusRules,
  usersQueryRules,
} from '../validators/adminValidators.js'

const router = Router()

router.use(authenticateToken, requireRole('ADMIN'))

router.get('/stats', getStats)
router.get('/trainers', getTrainers)
router.get('/users', usersQueryRules, validate, getUsers)
router.put('/users/:id/status', userIdRule, updateUserStatusRules, validate, updateUserStatus)
router.put('/trainers/:id/role', trainerIdRule, updateRoleRules, validate, updateTrainerRole)
router.delete('/trainers/:id', trainerIdRule, validate, deleteTrainer)

export default router