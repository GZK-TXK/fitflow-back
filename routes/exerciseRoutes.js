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

/**
 * @openapi
 * /api/exercises:
 *   get:
 *     tags: [Exercises]
 *     summary: List exercises
 *     responses:
 *       '200':
 *         description: List of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exercise'
 *       '401':
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getExercises)

/**
 * @openapi
 * /api/exercises/{id}:
 *   get:
 *     tags: [Exercises]
 *     summary: Get an exercise
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Exercise detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       '404':
 *         description: Exercise not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', exerciseIdRule, validate, getExerciseById)

/**
 * @openapi
 * /api/exercises:
 *   post:
 *     tags: [Exercises]
 *     summary: Create an exercise
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 120
 *               category:
 *                 type: string
 *                 maxLength: 60
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       '201':
 *         description: Created exercise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createExerciseRules, validate, createExercise)

/**
 * @openapi
 * /api/exercises/{id}:
 *   put:
 *     tags: [Exercises]
 *     summary: Update an exercise
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 120
 *               category:
 *                 type: string
 *                 maxLength: 60
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       '200':
 *         description: Updated exercise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       '404':
 *         description: Exercise not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', exerciseIdRule, updateExerciseRules, validate, updateExercise)

/**
 * @openapi
 * /api/exercises/{id}:
 *   delete:
 *     tags: [Exercises]
 *     summary: Delete an exercise
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '404':
 *         description: Exercise not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', exerciseIdRule, validate, deleteExercise)

export default router
