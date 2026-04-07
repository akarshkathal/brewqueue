export interface Shop {
  id: string
  name: string
  slug: string
  is_open: boolean
  avg_wait_minutes: number
}

export interface QueueEntry {
  id: string
  shop_id: string
  customer_name: string
  party_size: number
  status: 'waiting' | 'called' | 'served' | 'cancelled'
  position: number
  joined_at: string
  called_at: string | null
  served_at: string | null
}

export interface AuthUser {
  id: string
  email: string
  role: 'staff' | 'admin'
  shopId: string
}