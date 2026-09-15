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

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Global counters
 *     responses:
 *       '200':
 *         description: Platform counters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trainers:
 *                   type: integer
 *                 clients:
 *                   type: integer
 *                 exercises:
 *                   type: integer
 *                 workouts:
 *                   type: integer
 *                 pending:
 *                   type: integer
 *       '403':
 *         description: Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', getStats)

/**
 * @openapi
 * /api/admin/trainers:
 *   get:
 *     tags: [Admin]
 *     summary: List trainers
 *     responses:
 *       '200':
 *         description: List of trainers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/User'
 *                   - type: object
 *                     properties:
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       lastSeenAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       isOnline:
 *                         type: boolean
 *                       _count:
 *                         type: object
 *                         properties:
 *                           clients:
 *                             type: integer
 *                           exercises:
 *                             type: integer
 */
router.get('/trainers', getTrainers)

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users (optionally filtered by role)
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ADMIN, TRAINER, CLIENT]
 *     responses:
 *       '200':
 *         description: List of users (includes isOnline and lastSeenAt)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/User'
 *                   - type: object
 *                     properties:
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       lastSeenAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       isOnline:
 *                         type: boolean
 *                       _count:
 *                         type: object
 *                         properties:
 *                           clients:
 *                             type: integer
 *                           exercises:
 *                             type: integer
 */
router.get('/users', usersQueryRules, validate, getUsers)

/**
 * @openapi
 * /api/admin/users/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Set a user's account status
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, PENDING, DISABLED]
 *     responses:
 *       '200':
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Cannot change your own status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/users/:id/status', userIdRule, updateUserStatusRules, validate, updateUserStatus)

/**
 * @openapi
 * /api/admin/trainers/{id}/role:
 *   put:
 *     tags: [Admin]
 *     summary: Change a user's role
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, TRAINER, CLIENT]
 *     responses:
 *       '200':
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Cannot change your own role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/trainers/:id/role', trainerIdRule, updateRoleRules, validate, updateTrainerRole)

/**
 * @openapi
 * /api/admin/trainers/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user
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
 *       '400':
 *         description: Cannot delete your own account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/trainers/:id', trainerIdRule, validate, deleteTrainer)

export default router
