import { Router } from 'express'
import { getProfile, updateProfile, uploadAvatar } from '../controllers/profileController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { uploadAvatar as uploadAvatarMiddleware } from '../middlewares/upload.js'
import { validate } from '../middlewares/validate.js'
import { updateProfileRules } from '../validators/profileValidators.js'

const router = Router()

router.use(authenticateToken)

/**
 * @openapi
 * /api/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get own profile
 *     responses:
 *       '200':
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       '401':
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getProfile)

/**
 * @openapi
 * /api/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update own profile (name and phone)
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
 *                 maxLength: 80
 *               phone:
 *                 type: string
 *                 maxLength: 30
 *     responses:
 *       '200':
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/', updateProfileRules, validate, updateProfile)

/**
 * @openapi
 * /api/profile/avatar:
 *   post:
 *     tags: [Profile]
 *     summary: Upload/replace own profile photo
 *     description: Multipart upload (image only, max 5 MB) proxied to Cloudinary.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Updated profile with the new avatarUrl
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       '400':
 *         description: No file provided or invalid file type/size
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/avatar', uploadAvatarMiddleware, uploadAvatar)

export default router
