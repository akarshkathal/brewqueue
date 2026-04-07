import pool from '../config/db'
import { QueueEntry, Shop } from '../types'

// Get shop by its slug (e.g. 'blue-bottle')
export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const result = await pool.query<Shop>(
    'SELECT * FROM shops WHERE slug = $1',
    [slug]
  )
  // rows[0] is the first result, or undefined if nothing found
  // We return null if no shop found — easier to check than undefined
  return result.rows[0] || null
}

// Get all WAITING entries for a shop, ordered by position
export async function getQueueByShopId(shopId: string): Promise<QueueEntry[]> {
  const result = await pool.query<QueueEntry>(
    `SELECT * FROM queue_entries 
     WHERE shop_id = $1 AND status = 'waiting'
     ORDER BY position ASC`,
    [shopId]
  )
  return result.rows
}

// Get a single queue entry by its ID
export async function getEntryById(entryId: string): Promise<QueueEntry | null> {
  const result = await pool.query<QueueEntry>(
    'SELECT * FROM queue_entries WHERE id = $1',
    [entryId]
  )
  return result.rows[0] || null
}

// Add a new person to the queue
export async function joinQueue(
  shopId: string,
  customerName: string,
  partySize: number
): Promise<QueueEntry> {

  // First, find the current highest position in this shop's queue
  // If nobody is in the queue, this returns null — we default to 0
  const posResult = await pool.query(
    `SELECT MAX(position) as max_pos 
     FROM queue_entries 
     WHERE shop_id = $1 AND status = 'waiting'`,
    [shopId]
  )

  // If max_pos is null (empty queue), start at 1
  // Otherwise add 1 to the current highest position
  const nextPosition = (posResult.rows[0].max_pos || 0) + 1

  const result = await pool.query<QueueEntry>(
    `INSERT INTO queue_entries (shop_id, customer_name, party_size, position)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [shopId, customerName, partySize, nextPosition]
  )

  return result.rows[0]
}

// Update the status of a queue entry
// Used for: calling, serving, or cancelling
export async function updateEntryStatus(
  entryId: string,
  status: 'called' | 'served' | 'cancelled'
): Promise<QueueEntry | null> {

  // Use separate queries based on status to avoid type confusion
  let result

  if (status === 'called') {
    result = await pool.query<QueueEntry>(
      `UPDATE queue_entries
       SET status = $1, called_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, entryId]
    )
  } else if (status === 'served') {
    result = await pool.query<QueueEntry>(
      `UPDATE queue_entries
       SET status = $1, served_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, entryId]
    )
  } else {
    result = await pool.query<QueueEntry>(
      `UPDATE queue_entries
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, entryId]
    )
  }

  return result.rows[0] || null
}

// Toggle shop open/closed
export async function toggleShopStatus(
  shopId: string,
  isOpen: boolean
): Promise<Shop | null> {
  const result = await pool.query<Shop>(
    `UPDATE shops SET is_open = $1 WHERE id = $2 RETURNING *`,
    [isOpen, shopId]
  )
  return result.rows[0] || null
}