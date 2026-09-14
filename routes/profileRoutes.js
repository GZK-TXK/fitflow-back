import { Router } from 'express'
import { getProfile, updateProfile } from '../controllers/profileController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from '../middlewares/validate.js'
import { updateProfileRules } from '../validators/profileValidators.js'

const router = Router()

router.use(authenticateToken)

router.get('/', getProfile)
router.put('/', updateProfileRules, validate, updateProfile)

export default router