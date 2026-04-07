import { Request, Response } from 'express'
import * as queueService from '../services/queueService'
import { JoinQueueBody } from '../types'
import {
  emitQueueUpdate,
  emitEntryCalled,
  emitShopStatus
} from '../socket/socketHandler'

// GET /api/queue/:slug
// Returns the full waiting queue for a shop
// Used by: staff dashboard
export async function getQueue(req: Request, res: Response) {
  try {
    const shop = await queueService.getShopBySlug(req.params.slug as string)

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' })
    }

    const queue = await queueService.getQueueByShopId(shop.id)

    res.json({
      shop,
      queue,
      total: queue.length
    })
  } catch (err) {
    console.error('getQueue error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/queue/:slug/status/:entryId
// Returns a single customer's position in the queue
// Used by: customer status page
export async function getEntryStatus(req: Request, res: Response) {
  try {
    const shop = await queueService.getShopBySlug(req.params.slug as string)
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' })
    }

    const entry = await queueService.getEntryById(req.params.entryId as string)
    if (!entry) {
      return res.status(404).json({ message: 'Queue entry not found' })
    }

    // Count how many people are ahead of this customer
    const queue = await queueService.getQueueByShopId(shop.id)
    const position = queue.findIndex(e => e.id === entry.id) + 1
    const peopleAhead = position - 1
    const estimatedWait = peopleAhead * shop.avg_wait_minutes

    res.json({
      entry,
      position,
      peopleAhead,
      estimatedWaitMinutes: estimatedWait,
      shopIsOpen: shop.is_open
    })
  } catch (err) {
    console.error('getEntryStatus error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/queue/:slug/join
// Adds a customer to the queue
// Used by: customer join page
export async function joinQueue(req: Request, res: Response) {
  try {
    const shop = await queueService.getShopBySlug(req.params.slug as string)
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' })
    }

    if (!shop.is_open) {
      return res.status(400).json({ message: 'Shop is currently closed' })
    }

    const { customer_name, party_size = 1 }: JoinQueueBody = req.body

    if (!customer_name || customer_name.trim() === '') {
      return res.status(400).json({ message: 'Customer name is required' })
    }

    const entry = await queueService.joinQueue(
      shop.id,
      customer_name.trim(),
      party_size
    )

    // Get io from the Express app and broadcast the update
    const io = req.app.get('io')
    await emitQueueUpdate(io, shop.slug, shop.id)

    res.status(201).json({
      message: 'Successfully joined the queue',
      entry,
      shopName: shop.name
    })
  } catch (err) {
    console.error('joinQueue error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// PATCH /api/queue/:slug/entry/:entryId
// Updates entry status (call, serve, cancel)
// Used by: staff dashboard
export async function updateEntry(req: Request, res: Response) {
  try {
    const { status } = req.body

    if (!['called', 'served', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const entry = await queueService.updateEntryStatus(
      req.params.entryId as string,
      status
    )
    if (!entry) {
      return res.status(404).json({ message: 'Queue entry not found' })
    }

    const shop = await queueService.getShopBySlug(req.params.slug as string)
    const io = req.app.get('io')

    // If staff called a customer, notify that specific customer
    if (status === 'called') {
      emitEntryCalled(io, entry.id, entry.customer_name)
    }

    // Broadcast updated queue to all staff/customers watching
    if (shop) {
      await emitQueueUpdate(io, shop.slug, shop.id)
    }

    res.json({ message: 'Entry updated', entry })
  } catch (err) {
    console.error('updateEntry error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// PATCH /api/queue/:slug/toggle
// Opens or closes the shop
// Used by: staff dashboard
export async function toggleShop(req: Request, res: Response) {
  try {
    const shop = await queueService.getShopBySlug(req.params.slug as string)
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' })
    }

    const updated = await queueService.toggleShopStatus(shop.id, !shop.is_open)

    const io = req.app.get('io')
    emitShopStatus(io, shop.slug, updated?.is_open ?? false)

    res.json({
      message: `Shop is now ${updated?.is_open ? 'open' : 'closed'}`,
      shop: updated
    })
  } catch (err) {
    console.error('toggleShop error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}