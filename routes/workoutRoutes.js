import { Router } from 'express'
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutController.js'
import {
  addWorkoutItem,
  updateWorkoutItem,
  deleteWorkoutItem,
} from '../controllers/workoutItemController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from '../middlewares/validate.js'
import {
  workoutIdRule,
  createWorkoutRules,
  updateWorkoutRules,
} from '../validators/workoutValidators.js'
import {
  workoutItemIdRule,
  addWorkoutItemRules,
  updateWorkoutItemRules,
} from '../validators/workoutItemValidators.js'

const router = Router()

router.use(authenticateToken)

router.get('/', getWorkouts)
router.get('/:id', workoutIdRule, validate, getWorkoutById)
router.post('/', createWorkoutRules, validate, createWorkout)
router.put('/:id', workoutIdRule, updateWorkoutRules, validate, updateWorkout)
router.delete('/:id', workoutIdRule, validate, deleteWorkout)

// Ejercicios dentro de una rutina
router.post('/:id/items', workoutIdRule, addWorkoutItemRules, validate, addWorkoutItem)
router.put(
  '/:id/items/:itemId',
  workoutIdRule,
  workoutItemIdRule,
  updateWorkoutItemRules,
  validate,
  updateWorkoutItem
)
router.delete('/:id/items/:itemId', workoutIdRule, workoutItemIdRule, validate, deleteWorkoutItem)

export default router