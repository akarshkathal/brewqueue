import { Router } from 'express'
import * as queueController from '../controllers/queueController'

const router = Router()

// All routes here are prefixed with /api/queue
// (that prefix is set in app.ts)

router.get('/:slug', queueController.getQueue)
router.get('/:slug/status/:entryId', queueController.getEntryStatus)
router.post('/:slug/join', queueController.joinQueue)
router.patch('/:slug/entry/:entryId', queueController.updateEntry)
router.patch('/:slug/toggle', queueController.toggleShop)

export default router