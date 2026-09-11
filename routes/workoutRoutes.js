import { Router } from 'express'
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutController.js'
import { addWorkoutItem } from '../controllers/workoutItemController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from '../middlewares/validate.js'
import {
  workoutIdRule,
  createWorkoutRules,
  updateWorkoutRules,
} from '../validators/workoutValidators.js'
import { addWorkoutItemRules } from '../validators/workoutItemValidators.js'

const router = Router()

router.use(authenticateToken)

router.get('/', getWorkouts)
router.get('/:id', workoutIdRule, validate, getWorkoutById)
router.post('/', createWorkoutRules, validate, createWorkout)
router.put('/:id', workoutIdRule, updateWorkoutRules, validate, updateWorkout)
router.delete('/:id', workoutIdRule, validate, deleteWorkout)

// Añadir un ejercicio a una rutina
router.post('/:id/items', workoutIdRule, addWorkoutItemRules, validate, addWorkoutItem)

export default router