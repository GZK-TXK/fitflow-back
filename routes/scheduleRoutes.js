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

/**
 * @openapi
 * /api/schedule:
 *   post:
 *     tags: [Schedule]
 *     summary: Assign a routine to a client on a date
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId, workoutId, date]
 *             properties:
 *               clientId:
 *                 type: string
 *               workoutId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       '201':
 *         description: Created assignment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduledWorkout'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createScheduleRules, validate, createSchedule)

/**
 * @openapi
 * /api/schedule:
 *   get:
 *     tags: [Schedule]
 *     summary: List assignments in a date range
 *     parameters:
 *       - in: query
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       '200':
 *         description: List of assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ScheduledWorkout'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', scheduleQueryRules, validate, getSchedule)

/**
 * @openapi
 * /api/schedule/{id}:
 *   delete:
 *     tags: [Schedule]
 *     summary: Remove an assignment
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
 *         description: Assignment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', scheduleIdRule, validate, deleteSchedule)

export default router
