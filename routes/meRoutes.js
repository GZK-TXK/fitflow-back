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

/**
 * @openapi
 * /api/me/profile:
 *   get:
 *     tags: [Client portal]
 *     summary: Own profile + trainer contact
 *     responses:
 *       '200':
 *         description: Client profile with trainer contact details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *                 trainer:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     avatarUrl:
 *                       type: string
 *                       nullable: true
 *       '403':
 *         description: Client account pending or disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', getMyProfile)

/**
 * @openapi
 * /api/me/workouts:
 *   get:
 *     tags: [Client portal]
 *     summary: Own routines
 *     responses:
 *       '200':
 *         description: List of assigned routines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workout'
 */
router.get('/workouts', getMyWorkouts)

/**
 * @openapi
 * /api/me/workouts/{id}:
 *   get:
 *     tags: [Client portal]
 *     summary: Routine detail (with exercises)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Routine detail with exercise data
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
router.get('/workouts/:id', workoutIdRule, validate, getMyWorkoutById)

/**
 * @openapi
 * /api/me/schedule:
 *   get:
 *     tags: [Client portal]
 *     summary: Own calendar
 *     responses:
 *       '200':
 *         description: List of assignments for the client
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ScheduledWorkout'
 */
router.get('/schedule', getMySchedule)

export default router
