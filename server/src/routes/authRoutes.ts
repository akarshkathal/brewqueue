import { Router } from 'express'
import * as authController from '../controllers/authController'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Public route — no auth needed to log in
router.post('/login', authController.login)

// Protected route — must be logged in to access
// requireAuth runs first, then getMe
router.get('/me', requireAuth, authController.getMe)

export default router