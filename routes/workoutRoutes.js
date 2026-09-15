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

/**
 * @openapi
 * /api/workouts:
 *   get:
 *     tags: [Workouts]
 *     summary: List routines
 *     responses:
 *       '200':
 *         description: List of routines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workout'
 *       '401':
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getWorkouts)

/**
 * @openapi
 * /api/workouts/{id}:
 *   get:
 *     tags: [Workouts]
 *     summary: Get a routine (with items)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Routine detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workout'
 *       '404':
 *         description: Routine not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', workoutIdRule, validate, getWorkoutById)

/**
 * @openapi
 * /api/workouts:
 *   post:
 *     tags: [Workouts]
 *     summary: Create a routine for a client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, clientId]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 120
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               clientId:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created routine
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workout'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createWorkoutRules, validate, createWorkout)

/**
 * @openapi
 * /api/workouts/{id}:
 *   put:
 *     tags: [Workouts]
 *     summary: Update a routine
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
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 120
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       '200':
 *         description: Updated routine
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workout'
 *       '404':
 *         description: Routine not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', workoutIdRule, updateWorkoutRules, validate, updateWorkout)

/**
 * @openapi
 * /api/workouts/{id}:
 *   delete:
 *     tags: [Workouts]
 *     summary: Delete a routine
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
 *         description: Routine not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', workoutIdRule, validate, deleteWorkout)

/**
 * @openapi
 * /api/workouts/{id}/items:
 *   post:
 *     tags: [Workouts]
 *     summary: Add an exercise to a routine
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
 *             required: [exerciseId]
 *             properties:
 *               exerciseId:
 *                 type: string
 *               sets:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *               reps:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1000
 *               restTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 3600
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000
 *     responses:
 *       '201':
 *         description: Created routine item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkoutItem'
 *       '404':
 *         description: Routine or exercise not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/items', workoutIdRule, addWorkoutItemRules, validate, addWorkoutItem)

/**
 * @openapi
 * /api/workouts/{id}/items/{itemId}:
 *   put:
 *     tags: [Workouts]
 *     summary: Update a routine item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
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
 *               sets:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *               reps:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1000
 *               restTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 3600
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1000
 *     responses:
 *       '200':
 *         description: Updated routine item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkoutItem'
 *       '404':
 *         description: Routine item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id/items/:itemId',
  workoutIdRule,
  workoutItemIdRule,
  updateWorkoutItemRules,
  validate,
  updateWorkoutItem
)

/**
 * @openapi
 * /api/workouts/{id}/items/{itemId}:
 *   delete:
 *     tags: [Workouts]
 *     summary: Remove a routine item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
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
 *         description: Routine item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id/items/:itemId', workoutIdRule, workoutItemIdRule, validate, deleteWorkoutItem)

export default router
