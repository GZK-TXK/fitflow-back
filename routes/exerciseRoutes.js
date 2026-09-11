import { Router } from 'express'
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../controllers/exerciseController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from '../middlewares/validate.js'
import {
  exerciseIdRule,
  createExerciseRules,
  updateExerciseRules,
} from '../validators/exerciseValidators.js'

const router = Router()

router.use(authenticateToken)

router.get('/', getExercises)
router.get('/:id', exerciseIdRule, validate, getExerciseById)
router.post('/', createExerciseRules, validate, createExercise)
router.put('/:id', exerciseIdRule, updateExerciseRules, validate, updateExercise)
router.delete('/:id', exerciseIdRule, validate, deleteExercise)

export default router