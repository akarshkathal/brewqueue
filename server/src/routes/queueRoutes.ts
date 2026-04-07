import { Router } from 'express'
import * as queueController from '../controllers/queueController'
import { requireAuth } from '../middleware/auth'

const router = Router()

// PUBLIC routes — customers can access these without logging in
router.get('/:slug', queueController.getQueue)
router.get('/:slug/status/:entryId', queueController.getEntryStatus)
router.post('/:slug/join', queueController.joinQueue)

// PROTECTED routes — only logged in staff can access these
router.patch('/:slug/entry/:entryId', requireAuth, queueController.updateEntry)
router.patch('/:slug/toggle', requireAuth, queueController.toggleShop)

export default router