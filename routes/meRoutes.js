import { Router } from 'express'
import {
  getMyProfile,
  getMyWorkouts,
  getMyWorkoutById,
  getMySchedule,
} from '../controllers/meController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/requireRole.js'
import { requireClient } from '../middlewares/requireClient.js'
import { validate } from '../middlewares/validate.js'
import { workoutIdRule } from '../validators/workoutValidators.js'

const router = Router()

router.use(authenticateToken, requireRole('CLIENT'), requireClient)

router.get('/profile', getMyProfile)
router.get('/workouts', getMyWorkouts)
router.get('/workouts/:id', workoutIdRule, validate, getMyWorkoutById)
router.get('/schedule', getMySchedule)

export default router