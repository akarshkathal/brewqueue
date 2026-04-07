export interface Shop {
  id: string
  name: string
  slug: string
  is_open: boolean
  avg_wait_minutes: number
  created_at: Date
}

export interface QueueEntry {
  id: string
  shop_id: string
  customer_name: string
  party_size: number
  status: 'waiting' | 'called' | 'served' | 'cancelled'
  position: number
  joined_at: Date
  called_at: Date | null
  served_at: Date | null
}

export interface User {
  id: string
  shop_id: string
  email: string
  password_hash: string
  role: 'staff' | 'admin'
  created_at: Date
}

// This is what comes back when a customer joins the queue
export interface JoinQueueBody {
  customer_name: string
  party_size?: number
}

// This is what the JWT token contains after staff logs in
export interface JwtPayload {
  userId: string
  shopId: string
  role: 'staff' | 'admin'
}