import { Router } from 'express'
import {
  createSchedule,
  getSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/requireRole.js'
import { validate } from '../middlewares/validate.js'
import {
  scheduleIdRule,
  createScheduleRules,
  scheduleQueryRules,
} from '../validators/scheduleValidators.js'

const router = Router()

router.use(authenticateToken, requireRole(['TRAINER', 'ADMIN']))

router.post('/', createScheduleRules, validate, createSchedule)
router.get('/', scheduleQueryRules, validate, getSchedule)
router.delete('/:id', scheduleIdRule, validate, deleteSchedule)

export default router