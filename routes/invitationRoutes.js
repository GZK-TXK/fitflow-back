import { Router } from 'express'
import { createInvitation, getInvitation } from '../controllers/invitationController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from '../middlewares/validate.js'
import {
  createInvitationRules,
  invitationTokenRule,
} from '../validators/invitationValidators.js'

const router = Router()

/**
 * @openapi
 * /api/invitations/{token}:
 *   get:
 *     tags: [Invitations]
 *     summary: Check an invitation
 *     description: Public endpoint used by the registration page to know if an invitation is valid.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Invitation status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvitationStatus'
 *       '404':
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:token', invitationTokenRule, validate, getInvitation)

/**
 * @openapi
 * /api/invitations:
 *   post:
 *     tags: [Invitations]
 *     summary: Create an invitation
 *     description: Admins can invite trainers and clients; trainers can invite their own clients. The email must match an existing client when type is CLIENT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, email]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [TRAINER, CLIENT]
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '201':
 *         description: Invitation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invitation'
 *       '403':
 *         description: Not allowed to invite that role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: No matching client for that email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateToken, createInvitationRules, validate, createInvitation)

export default router
